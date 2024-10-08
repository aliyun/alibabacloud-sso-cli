import { request, read } from 'httpx';
import kitx from 'kitx';
import { getProxyAgent } from './proxy_agent.js';

const sha256 = kitx.createHash('sha256');

function transform(input) {
  const hashed = sha256(input, 'base64');
  return hashed.replace(/\+/g, '-') // + => -
    .replace(/\//g, '_') // / => _
    .replace(/=+$/g, ''); // 移除结尾的 =
}

function is2xx(code) {
  return code >= 200 && code < 300;
}

export default class SSO {
  constructor(opts = {}) {
    this.protocol = opts.protocol || 'https:';
    this.host = opts.host;
    this.clientId = opts.clientId;
    this.prefix = `${this.protocol}//${this.host}`;
    this.codeVerifier = opts.codeVerifier;
  }

  async startDeviceAuthorization(opts) {
    const url = `${this.prefix}/device-authorization`;
    const response = await request(url, {
      method: 'POST',
      readTimeout: 10000,
      agent: getProxyAgent(),
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      data: JSON.stringify({
        'PortalUrl': opts.portalUrl,
        'CodeChallenge': transform(this.codeVerifier),
        'ClientId': this.clientId,
        'CodeChallengeMethod': 'S256'
      })
    });

    const body = await read(response, 'utf8');
    if (!is2xx(response.statusCode)) {
      const err = JSON.parse(body);
      const ex = new Error();
      ex.message = `${err.ErrorCode}: ${err.ErrorMessage} ${err.RequestId}`;
      ex.code = err.ErrorCode;
      throw ex;
    }

    return JSON.parse(body);
  }

  async createAccessToken(opts) {
    const url = `${this.prefix}/token`;
    const response = await request(url, {
      method: 'POST',
      readTimeout: 10000,
      agent: getProxyAgent(),
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      data: JSON.stringify({
        'CodeVerifier': this.codeVerifier,
        'ClientId': this.clientId,
        'DeviceCode': opts.deviceCode,
        'GrantType': 'urn:ietf:params:oauth:grant-type:device_code'
      })
    });

    const body = await read(response, 'utf8');
    if (!is2xx(response.statusCode)) {
      const err = JSON.parse(body);
      const ex = new Error();
      ex.message = `${err.ErrorCode}: ${err.ErrorMessage} ${err.RequestId}`;
      ex.code = err.ErrorCode;
      throw ex;
    }

    return JSON.parse(body);
  }
}
