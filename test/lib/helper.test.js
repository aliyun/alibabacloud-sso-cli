import { deepStrictEqual } from 'assert';

import { loadConfig, saveConfig, loadSTSCache, saveSTSCache, addToProfile, removeProfile } from '../../lib/helper.js';
import { URL, fileURLToPath } from 'url';
import { rm, access, constants } from 'fs/promises';

describe('lib/helper', function() {
  it('loadConfig should ok', async function () {
    const path = fileURLToPath(new URL('../figures/config.json', import.meta.url));
    const config = await loadConfig(path);
    deepStrictEqual(config, {
      'signinUrl': 'https://signin-cn-shanghai.alibabacloudsso.com/test/login'
    });
  });

  it('loadConfig with invalid path should ok', async function () {
    const path = fileURLToPath(new URL('../figures/invalid_config.json', import.meta.url));
    const config = await loadConfig(path);
    deepStrictEqual(config, {});
  });

  it('saveConfig should ok', async function () {
    const path = fileURLToPath(new URL('../figures/tmp_config.json', import.meta.url));
    const config = await loadConfig(path);
    deepStrictEqual(config, {});
    config.signUrl = 'test';
    await saveConfig(config, path);
    const configCopy = await loadConfig(path);
    deepStrictEqual(configCopy, {
      signUrl: 'test'
    });
    await rm(path);
  });

  it('loadSTSCache should ok', async function () {
    const path = fileURLToPath(new URL('../figures/sts_cache.json', import.meta.url));
    const config = await loadSTSCache(path);
    deepStrictEqual(config, {
      'accessToken': {
        'expireTime': 1699342746963,
        'token': 'token'
      },
      'current': 'default',
      'map': {
        'accountid:configureid': {
          'data': {
            'access_key_Secret': 'aksecret',
            'access_key_id': 'akid',
            'mode': 'StsToken',
            'sts_token': 'token'
          },
          'expireTime': 1699346328000
        }
      },
      'profiles': {
        'default': 'accountid:configureid'
      }
    });
  });

  it('loadSTSCache with invalid path should ok', async function () {
    const path = fileURLToPath(new URL('../figures/invalid_sts_cache.json', import.meta.url));
    const config = await loadSTSCache(path);
    deepStrictEqual(config, {
      'accessToken': {
        'expireTime': '',
        'token': ''
      },
      'current': '',
      'map': {},
      'profiles': {}
    });
  });

  it('saveSTSCache should ok', async function () {
    const path = fileURLToPath(new URL('../figures/tmp_sts_cache.json', import.meta.url));
    try {
      await access(path, constants.R_OK);
      await rm(path);
    } catch (ex) {
      // ignore
    }

    const cache = await loadSTSCache(path);
    deepStrictEqual(cache, {
      'accessToken': {
        'expireTime': '',
        'token': ''
      },
      'current': '',
      'map': {},
      'profiles': {}
    });
    addToProfile(cache, 'test', {
      accountId: 'accountId',
      accessConfigurationId: 'accessConfigurationId',
      expireTime: 123,
      data: {}
    });
    cache.current = 'test';
    await saveSTSCache(cache, path);

    const cacheCopy = await loadSTSCache(path);
    deepStrictEqual(cacheCopy, {
      'accessToken': {
        'expireTime': '',
        'token': ''
      },
      'current': 'test',
      'map': {
        'accountId:accessConfigurationId': {
          'data': {},
          'expireTime': 123
        }
      },
      'profiles': {
        'test': 'accountId:accessConfigurationId'
      }
    });
    await rm(path);
  });

  it('addToProfile/removeProfile should ok', async function () {
    const cache = {
      'accessToken': {
        'expireTime': '',
        'token': ''
      },
      'current': '',
      'map': {},
      'profiles': {}
    };

    addToProfile(cache, 'test', {
      accountId: 'accountId',
      accessConfigurationId: 'accessConfigurationId',
      expireTime: 123,
      data: {}
    });

    deepStrictEqual(cache, {
      'accessToken': {
        'expireTime': '',
        'token': ''
      },
      'current': 'test',
      'map': {
        'accountId:accessConfigurationId': {
          'data': {},
          'expireTime': 123
        }
      },
      'profiles': {
        'test': 'accountId:accessConfigurationId'
      }
    });

    removeProfile(cache, 'test');
    deepStrictEqual(cache, {
      'accessToken': {
        'expireTime': '',
        'token': ''
      },
      'current': '',
      'map': {
        'accountId:accessConfigurationId': {
          data: {},
          expireTime: 123
        }
      },
      'profiles': {
        'test': undefined
      }
    });
  });
});
