#!/usr/bin/env node

import { URL, fileURLToPath } from 'url';
import minimist from 'minimist';
import { loadJSONSync } from 'kitx';

import CLI from '../lib/cli.js';
import Login from '../commands/login.js';
import Configure from '../commands/configure.js';
import Profile from '../commands/profile.js';
import Doc from '../commands/doc.js';

const pkgPath = new URL('../package.json', import.meta.url);
const pkg = loadJSONSync(fileURLToPath(pkgPath));
const argv = minimist(process.argv.slice(2));

const app = new CLI('acs-sso', pkg.version, 'Alibaba Cloud SSO CLI');
app.registerCommand(Login);
app.registerCommand(Configure);
app.registerCommand(Profile);
app.registerCommand(Doc);
app.run(argv);
