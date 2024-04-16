import os from 'os';
import path from 'path';
import { access, constants, readFile, writeFile } from 'fs/promises';

export const SSO_CONFIG_FILE = path.join(os.homedir(), '.alibabacloud_sso');

export async function loadConfig(filePath = SSO_CONFIG_FILE) {
  try {
    await access(filePath, constants.R_OK);
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (ex) {
    // give back default config
    return {};
  }
}

export async function saveConfig(config, filePath = SSO_CONFIG_FILE) {
  await writeFile(filePath, JSON.stringify(config));
}

const SSO_STS = path.join(os.homedir(), '.alibabacloud_sso_sts');

export async function loadSTSCache(cacheFilePath = SSO_STS) {
  try {
    await access(cacheFilePath, constants.R_OK);
  } catch (ex) {
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

  const content = await readFile(cacheFilePath, 'utf8');
  const cache = JSON.parse(content);
  cache.map = cache.map || {};
  cache.profiles = cache.profiles || {};
  cache.accessToken = cache.accessToken || {};
  return cache;
}

export function addToProfile(cache, profile, profileData) {
  const { accountId, accessConfigurationId, expireTime, data } = profileData;
  const cacheKey = `${accountId}:${accessConfigurationId}`;
  cache.current = profile;
  cache.profiles[profile] = cacheKey;
  cache.map[cacheKey] = {
    expireTime,
    data
  };
}

export function removeProfile(cache, profile) {
  cache.profiles[profile] = undefined;
  if (cache.current === profile) {
    cache.current = '';
  }
}

export async function saveSTSCache(config, cacheFilePath = SSO_STS) {
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

  await writeFile(cacheFilePath, JSON.stringify(config));
}
