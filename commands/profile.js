import Table from 'cli-table3';

import {loadSTSCache, saveSTSCache, removeProfile} from '../lib/helper.js';

export default class Profile {
  constructor(app) {
    this.app = app;
    this.name = 'profile';
    this.description = 'list or delete profiles';
    this.useArgs = '0-n';
    this.options = {
      delete: {
        required: false,
        description: `delete the specify profile`
      },
      profile: {
        required: false,
        description: `the profile name`
      },
    };
  }

  registerCommand(Command) {
    const cmd = new Command(this);
    this.commands.set(cmd.name, cmd);
  }

  async run(argv) {
    const cache = await loadSTSCache();
    if (argv.delete) {
      if (!argv.profile) {
        console.error(`Must specify profile name with --profile flag.`);
        process.exit(-1);
      }

      const profile = argv.profile;
      if (!cache.profiles[profile]) {
        console.error(`The profile '${profile}' is inexist.`);
        process.exit(-1);
      }

      removeProfile(cache, profile);

      await saveSTSCache(cache);
      console.log(`Delete the profile '${profile}' successful.`);
      return;
    }

    const table = new Table({
      head: ['Profile', 'Access ID', 'Access Configuration ID', 'Status'],
      style: {
        head: [],
        border: []
      }
    });
    const profiles = Object.keys(cache.profiles);
    if (profiles.length > 0) {
      for (let i = 0; i < profiles.length; i++) {
        const profileName = profiles[i];
        let name = profileName;
        if (profileName === cache.current) {
          name += ' *';
        }

        const cacheKey = cache.profiles[profileName];
        const result = cache.map[cacheKey];
        const timeToExpired = result.expireTime - Date.now();
        const [accountId, accessConfigurationId] = cacheKey.split(':');
        table.push([
          name,
          accountId,
          accessConfigurationId,
          timeToExpired > 0 ? 'Available' : 'Expired'
        ]);
      }
    } else {
      table.push([
        { colSpan: 4, content: 'No any profiles', hAlign: 'center' }
      ]);
    }
    console.log(table.toString());

    return;
  }
}
