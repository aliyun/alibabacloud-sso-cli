import { deepStrictEqual } from 'assert';

import { spawn } from './spawn.js';
import { fileURLToPath } from 'url';
import { loadJSONSync } from 'kitx';

const pkg = loadJSONSync(fileURLToPath(new URL('../package.json', import.meta.url)));

describe('bin/acs-sso', function() {
  it('acc', async function () {
    const {code, stdout, stderr} = await spawn('node', ['../bin/acs-sso.js'], {
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
});
