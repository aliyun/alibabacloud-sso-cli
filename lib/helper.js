import os from 'os';
import path from 'path';
import fs from 'fs';

const SSO_CONFIG_FILE = path.join(os.homedir(), '.alibabacloud_sso');

export function loadConfig() {
  if (fs.existsSync(SSO_CONFIG_FILE)) {
    const content = fs.readFileSync(SSO_CONFIG_FILE, 'utf8');
    return JSON.parse(content);
  }

  // give back default config
  return {};
}

export function saveConfig(config) {
  fs.writeFileSync(SSO_CONFIG_FILE, JSON.stringify(config));
}

const SSO_STS = path.join(os.homedir(), '.alibabacloud_sso_sts');

export function loadSTSCache() {
  if (fs.existsSync(SSO_STS)) {
    const content = fs.readFileSync(SSO_STS, 'utf8');
    const cache = JSON.parse(content);
    cache.map = cache.map || {};
    cache.profiles = cache.profiles || {};
    cache.accessToken = cache.accessToken || {};
    return cache;
  }

  return {
    // 当前 profile
    'current': '',
    'map': {},
    'profiles': {},
    'accessToken': {
      'token': '',
      'expireTime': ''
    }
  };
}

export function saveSTSCache(config) {
  const cacheKeys = Object.keys(config.map);
  const profiles = Object.keys(config.profiles);

  for (let i = 0; i < cacheKeys.length; i++) {
    const cacheKey = cacheKeys[i];
    const profile = profiles.find((profile) => {
      return config.profiles[profile] === cacheKey;
    });

    if (!profile) {
      // 如果未找到引用本记录的 profile 名，删除本记录
      config.map[cacheKey] = undefined;
    }
  }
  fs.writeFileSync(SSO_STS, JSON.stringify(config));
}
