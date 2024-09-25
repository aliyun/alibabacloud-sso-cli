import os from 'os';

import open from 'open';
import kitx from 'kitx';
import inquirer from 'inquirer';

import SSO from '../lib/sso.js';
import Portal from '../lib/portal.js';
import { saveSTSCache, loadSTSCache, loadConfig, addToProfile } from '../lib/helper.js';

export default class Login {
  constructor(app) {
    this.app = app;
    this.name = 'login';
    this.description = 'login with SSO account';
    this.useArgs = '0-n';
    this.options = {
      profile: {
        required: false,
        description: `the profile name, default: 'default'`
      },
      force: {
        required: false,
        description: 'ignore cached credential'
      },
      env: {
        required: false,
        description: 'output as environment variables'
      },
      account_id: {
        required: false,
        description: 'account id'
      },
      access_config: {
        required: false,
        description: 'access_config name for the account id'
      }
    };
  }

  async getAccessToken(ctx) {
    const signinUrl = ctx.signinUrl;
    const sso = new SSO({
      host: signinUrl.host,
      protocol: signinUrl.protocol,
      // 为特殊环境可替换配置
      clientId: process.env.ALIBABACLOUD_SSO_CLIENT_ID || 'app-vaz16tltdxs96audqf35',
      // 长度至少 43, md5 值 32 位，整体 64 位
      codeVerifier: kitx.makeNonce() + kitx.md5(os.hostname() + os.uptime() + process.uptime(), 'hex')
    });

    const result = await sso.startDeviceAuthorization({
      portalUrl: signinUrl.href
    });

    // open the browser
    await open(result.VerificationUriComplete);

    // eslint-disable-next-line max-len
    console.log(`If your default browser is not opened automatically, please use the following URL to finish the signin process.`);
    console.log();
    console.log(`Signin URL: ${result.VerificationUri}`);
    console.log(`User Code: ${result.UserCode}`);
    console.log();
    console.log(`And now you can login into your account from the browser with your SSO configurations.`);

    const deviceCode = result.DeviceCode;
    // pending for login complete
    let response;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        response = await sso.createAccessToken({
          deviceCode: deviceCode
        });
        break;
      } catch (ex) {
        if (ex.code === 'AuthorizationPending') {
          await kitx.sleep(result.Interval * 1000);
          continue;
        }

        if (ex.code === 'InvalidDeviceCodeError') {
          console.error(`Your request has been expired, please login again.`);
          process.exit(-1);
        }

        throw ex;
      }
    }

    console.log(`You have logged in.`);

    return {
      // 提前10s过期
      expireTime: Date.now() + response.ExpiresIn - 10000,
      token: response.AccessToken
    };
  }

  async login(ctx) {
    const cache = ctx.cache;
    const profile = ctx.profile;
    if (!cache.accessToken || !cache.accessToken.expireTime || Date.now() >= cache.accessToken.expireTime) {
      cache.accessToken = await this.getAccessToken(ctx);
      await saveSTSCache(cache);
    }

    const accessToken = cache.accessToken.token;
    const url = ctx.signinUrl;
    const portal = new Portal({
      host: url.host,
      protocol: url.protocol,
      accessToken: accessToken
    });

    let accountId, accessConfigurationId;
    if (cache.profiles[profile]) {
      // use the saved accountId, accessConfigurationId
      [accountId, accessConfigurationId] = cache.profiles[profile].split(':');
    } else {
      const accounts = await portal.listAllAccounts();

      if (accounts.length === 0) {
        console.error(`You don't have access to any account.`);
        process.exit(-1);
      }

      if (ctx.account_id) {
        // use user defined accountId
        accountId = ctx.account_id;
        if (!accounts.find((d) => d.AccountId === accountId)) {
          console.error(`The account '${accountId}' does not exist in your account list.`);
          process.exit(-1);
        }
      }
      else {
        let sa;
        if (accounts.length > 1) {
          // 有多个账号时启动选择
          const choices = accounts.map((d) => {
            return {
              name: `${d.DisplayName}(${d.AccountId})`,
              value: d
            };
          });
          const account = await inquirer.prompt([{
            type: 'list',
            name: 'account',
            choices: choices,
            message: `You have ${accounts.length} accounts, please select one:`
          }]);
          sa = account.account;
        } else {
          sa = accounts[0];
        }

        accountId = sa.AccountId;
        console.log(`used account: ${sa.DisplayName}(${accountId})`);
      }
      const configs = await portal.listAllAccessConfigurations({
        accountId: accountId
      });

      let selectedConfig;
      // use user defined accessConfig name
      if (ctx.access_config) {
        selectedConfig = configs.find((d) => d.AccessConfigurationName === ctx.access_config);
        if (!selectedConfig) {
          console.error(`The access configuration '${ctx.access_config}' does not exist in your account.`);
          process.exit(-1);
        }
      }
      else if (configs.length > 1) {
        const choices = configs.map((d) => {
          return {
            name: `${d.AccessConfigurationName}(${d.AccessConfigurationId})`,
            value: d
          };
        });
        const answers = await inquirer.prompt([{
          type: 'list',
          name: 'configuration',
          choices: choices,
          message: `You have ${configs.length} access configurations, please select one:`
        }]);
        selectedConfig = answers.configuration;
      } else {
        selectedConfig = configs[0];
      }

      accessConfigurationId = selectedConfig.AccessConfigurationId;
      console.log(`used access configuration: ${selectedConfig.AccessConfigurationName}(${accessConfigurationId})`);
    }

    const credential = await portal.createCloudCredential({
      accountId: accountId,
      accessConfigurationId: accessConfigurationId
    });

    const result = {
      expireTime: new Date(credential.CloudCredential.Expiration).getTime(),
      data: {
        'mode': 'StsToken',
        'access_key_id': credential.CloudCredential.AccessKeyId,
        'access_key_secret': credential.CloudCredential.AccessKeySecret,
        'sts_token': credential.CloudCredential.SecurityToken
      }
    };

    // save into cache
    addToProfile(cache, profile, {
      accountId,
      accessConfigurationId,
      expireTime: result.expireTime,
      data: result.data
    });
    await saveSTSCache(cache);

    return result;
  }

  display(data, env) {
    if (env) {
      console.log(`export ALIBABA_CLOUD_ACCESS_KEY_ID=${data.access_key_id}`);
      console.log(`export ALIBABA_CLOUD_ACCESS_KEY_SECRET=${data.access_key_secret}`);
      console.log(`export ALIBABA_CLOUD_SECURITY_TOKEN=${data.sts_token}`);
      // old
      console.log(`export ALIBABACLOUD_ACCESS_KEY_ID=${data.access_key_id}`);
      console.log(`export ALIBABACLOUD_ACCESS_KEY_SECRET=${data.access_key_secret}`);
      console.log(`export SECURITY_TOKEN=${data.sts_token}`);
      // for terraform
      console.log(`export ALICLOUD_ACCESS_KEY=${data.access_key_id}`);
      console.log(`export ALICLOUD_SECRET_KEY=${data.access_key_secret}`);
      console.log(`export ALICLOUD_SECURITY_TOKEN=${data.sts_token}`);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async run(argv) {
    const app = this.app;
    const cache = await loadSTSCache();
    const profile = argv.profile || cache.current || 'default';

    const config = await loadConfig();
    const signinUrl = config.signinUrl;
    if (!signinUrl) {
      console.error(`Please use '${app.name} configure' to set signin url.`);
      process.exit(-1);
    }

    const ctx = { cache, config, signinUrl: new URL(signinUrl), profile };

    if (!argv.force) {
      // 没有强制登录，优先检查缓存
      const key = cache.profiles[profile];
      if (key) { // key 正常
        const sts = cache.map[key];
        if (sts && sts.expireTime > Date.now()) { // 有缓存且未过期
          this.display(sts.data, argv.env);
          return;
        }
      }
    }

    const result = await this.login(ctx);
    this.display(result.data, argv.env);
  }
}
