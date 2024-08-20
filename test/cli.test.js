import { deepStrictEqual } from 'assert';

import { spawn } from './spawn.js';
import { fileURLToPath } from 'url';
import { loadJSONSync } from 'kitx';

const pkg = loadJSONSync(fileURLToPath(new URL('../package.json', import.meta.url)));

describe('bin/acs-sso', function () {
  it('acs-sso', async function () {
    const { code, stdout, stderr } = await spawn('node', ['../bin/acs-sso.js'], {
      cwd: fileURLToPath(new URL('./', import.meta.url))
    });
    deepStrictEqual(stderr, '');
    deepStrictEqual(stdout, `Alibaba Cloud SSO CLI v${pkg.version}

   help              print help information
   version           print version
   completion        auto completion
   login             login with SSO account
   configure         configure signin url
   profile           list or delete profiles

`);
    deepStrictEqual(code, 0);
  });

  it('acs-sso version', async function () {
    const { code, stdout, stderr } = await spawn('node', ['../bin/acs-sso.js', 'version'], {
      cwd: fileURLToPath(new URL('./', import.meta.url))
    });
    deepStrictEqual(stderr, '');
    deepStrictEqual(stdout, `${pkg.version}
`);
    deepStrictEqual(code, 0);
  });

  it('acs-sso help version', async function () {
    const { code, stdout, stderr } = await spawn('node', ['../bin/acs-sso.js', 'help', 'version'], {
      cwd: fileURLToPath(new URL('./', import.meta.url))
    });
    deepStrictEqual(stderr, '');
    deepStrictEqual(stdout, `Usage:
   acs-sso version

Description:
   print version
`);
    deepStrictEqual(code, 0);
  });

  it('acs-sso help login', async function () {
    const { code, stdout, stderr } = await spawn('node', ['../bin/acs-sso.js', 'help', 'login'], {
      cwd: fileURLToPath(new URL('./', import.meta.url))
    });
    deepStrictEqual(stderr, '');
    deepStrictEqual(stdout, `Usage:
   acs-sso login
   acs-sso login [options]

Description:
   login with SSO account

Options:
   --profile         [Optional] the profile name, default: 'default'
   --force           [Optional] ignore cached credential
   --env             [Optional] output as environment variables
   --account_id      [Optional] account id
   --access_config   [Optional] access_config name for the account id
`);
    deepStrictEqual(code, 0);
  });

  it('acs-sso invalid', async function () {
    const { code, stdout, stderr } = await spawn('node', ['../bin/acs-sso.js', 'invalid'], {
      cwd: fileURLToPath(new URL('./', import.meta.url))
    });
    deepStrictEqual(stderr, '');
    deepStrictEqual(stdout, `invalid sub-command 'invalid'
Alibaba Cloud SSO CLI v${pkg.version}

   help              print help information
   version           print version
   completion        auto completion
   login             login with SSO account
   configure         configure signin url
   profile           list or delete profiles

`);
    deepStrictEqual(code, 255);
  });
});
