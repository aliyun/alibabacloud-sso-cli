import { exec, spawn } from 'child_process';

function openURL(url) {
  switch (process.platform) {
    case 'darwin':
      exec('open ' + url);
      break;
    case 'win32':
      exec('start ' + url);
      break;
    default:
      spawn('xdg-open', [url]);
    // I use `spawn` since `exec` fails on my machine (Linux i386).
    // I heard that `exec` has memory limitation of buffer size of 512k.
    // http://stackoverflow.com/a/16099450/222893
    // But I am not sure if this memory limit causes the failure of `exec`.
    // `xdg-open` is specified in freedesktop standard, so it should work on
    // Linux, *BSD, solaris, etc.
  }
}

export default class Doc {
  constructor(app) {
    this.app = app;
    this.name = 'doc';
    this.description = 'open help documentation in browser';
    this.useArgs = '0-n';
    this.options = {
      language: {
        required: false,
        description: `the language code. 'en' or 'cn'`
      },
    };
  }

  registerCommand(Command) {
    const cmd = new Command(this);
    this.commands.set(cmd.name, cmd);
  }

  async run(argv) {
    const id = 'use-alibaba-cloud-cli-to-access-cloudsso-and-alibaba-cloud-resources';
    let url = `https://help.aliyun.com/zh/cloudsso/user-guide/${id}`;
    if (argv.language === 'en') {
      url = `https://www.alibabacloud.com/help/en/cloudsso/user-guide/${id}`;
    }

    openURL(url);

    return;
  }
}
