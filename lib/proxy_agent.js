

import ProxyAgent from 'proxy-agent';

export function getProxyAgent() {
  if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.NO_PROXY) {
    return new ProxyAgent();
  }

  return null;
}
