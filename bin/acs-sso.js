#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2));

const CLI = require('../lib/cli');
const pkg = require('../package.json');

const app = new CLI('acs-sso', pkg.version, 'Alibaba Cloud SSO CLI');
app.registerCommand(require('../commands/login'));
app.registerCommand(require('../commands/configure'));
app.registerCommand(require('../commands/profile'));
app.run(argv);
