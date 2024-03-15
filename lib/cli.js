function padding(input, max) {
  if (input.length < max) {
    return input + ' '.repeat(max - input.length);
  }

  return input;
}

class Version {
  constructor(app) {
    this.app = app;
    this.name = 'version';
    this.description = 'print version';
    this.useArgs = '0';
  }

  async run(argv) {
    console.log(this.app.version);
  }
}

class Help {
  constructor(app) {
    this.app = app;
    this.name = 'help';
    this.description = 'print help information';
    this.useArgs = '0-n';
  }

  async run (argv) {
    const app = this.app;
    const [subcommand] = argv._.slice(1);
    if (subcommand) {
      await app.printUsage(subcommand);
      return;
    }

    console.log(`${app.description} v${app.version}`);
    console.log();

    for (const [name, cmd] of app.commands) {
      console.log(`   ${name}${' '.repeat(18 - name.length)}${cmd.description}`);
    }
    console.log();
  }
}

class Completion {
  constructor(app) {
    this.app = app;
    this.name = 'completion';
    this.description = 'auto completion';
    this.useArgs = '0';
  }

  async run(argv) {
    const shell = process.env.SHELL;
    if (shell.endsWith('/zsh')) {
      let script = `# Installation: ${this.app.name} completion >> ~/.bashrc\n`;
      script += `# or ${this.app.name} completion >> ~/.bash_profile on OSX.\n`;
      script += `complete -C ${this.app.name} ${this.app.name}\n`;
      script += `# end of ${this.app.name} completion`;
      console.log(script);
    } else {
      //
    }
  }
}

export default class CLI {
  constructor(name, version, description) {
    this.name = name;
    this.version = version;
    this.description = description;
    this.commands = new Map();
    this.registerCommand(Help);
    this.registerCommand(Version);
    this.registerCommand(Completion);
  }

  registerCommand(Command) {
    const cmd = new Command(this);
    this.commands.set(cmd.name, cmd);
  }

  async completion(args) {
    if (args.length === 0) {
      for (const [name] of this.commands) {
        console.log(name);
      }
      return;
    }

    if (args.length === 1) {
      const prefix = args[0];
      for (const [name] of this.commands) {
        if (name.startsWith(prefix)) {
          console.log(name);
        }
      }
      return;
    }

    // eslint-disable-next-line no-unused-vars
    const [name, ...others] = args;
    const cmd = this.commands.get(name);
    if (cmd.options) {
      Object.keys(cmd.options).forEach((item) => {
        console.log(`--${item}`);
      });
    }
  }

  async process(argv) {
    // auto completion
    if (process.env.COMP_LINE) {
      await this.completion(process.env.COMP_LINE.split(' ').slice(1));
      return;
    }

    const [subcommand] = argv._;
    if (this.commands.has(subcommand)) {
      await this.runCommand(subcommand, argv);
      return;
    }

    if (subcommand) {
      console.log(`invalid sub-command '${subcommand}'`);
      await this.runCommand('help', argv);
      process.exit(-1);
    }

    await this.runCommand('help', argv);
  }

  async runCommand(subcommand, argv) {
    const cmd = this.commands.get(subcommand);
    await cmd.run(argv);
  }

  async printUsage(subcommand) {
    const cmd = this.commands.get(subcommand);
    console.log(`Usage:`);
    if (cmd.useArgs === '0-n') {
      console.log(`   ${this.name} ${subcommand}`);
      console.log(`   ${this.name} ${subcommand} [options]`);
    } else if (cmd.useArgs === '1-n') {
      console.log(`   ${this.name} ${subcommand} [options]`);
    } else if (cmd.useArgs === '0') {
      console.log(`   ${this.name} ${subcommand}`);
    }

    if (cmd.description) {
      console.log();
      console.log('Description:');
      console.log(`   ${cmd.description}`);
    }

    if (cmd.options) {
      console.log();
      console.log('Options:');
      const max = Math.max(...Object.keys(cmd.options).map((key) => key.length));
      Object.keys(cmd.options).forEach((key) => {
        let line = `   --${padding(key, max)}   `;
        if (cmd.options[key].required) {
          line += '[Required] ';
        } else {
          line += '[Optional] ';
        }
        line += cmd.options[key].description;
        console.log(line);
      });
    }
  }

  run(argv) {
    // global handle
    this.process(argv).then(() => {
      process.exit(0);
    }).catch((err) => {
      console.log(err.stack);
      process.exit(-1);
    });
  }
}
