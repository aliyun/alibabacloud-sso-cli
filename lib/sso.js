'use strict';

const httpx = require('httpx');
const kitx = require('kitx');
const { getProxyAgent } = require('./proxy_agent');

const sha256 = kitx.createHash('sha256');

function transform(input) {
  const hashed = sha256(input, 'base64');
  return hashed.replace(/\+/g, '-') // + => -
    .replace(/\//g, '_') // / => _
    .replace(/=+$/g, ''); // 移除结尾的 =
}

class SSO {
  constructor(opts = {}) {
    this.protocol = opts.protocol || 'https:';
    this.host = opts.host;
    this.clientId = opts.clientId;
    this.prefix = `${this.protocol}//${this.host}`;
    this.codeVerifier = opts.codeVerifier;
  }

  async startDeviceAuthorization(opts) {
    const url = `${this.prefix}/device-authorization`;
    const response = await httpx.request(url, {
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

    const body = await httpx.read(response, 'utf8');
    if (response.statusCode === 400) {
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
    const response = await httpx.request(url, {
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

    const body = await httpx.read(response, 'utf8');
    if (response.statusCode === 400) {
      const err = JSON.parse(body);
      const ex = new Error();
      ex.message = `${err.ErrorCode}: ${err.ErrorMessage} ${err.RequestId}`;
      ex.code = err.ErrorCode;
      throw ex;
    }

    return JSON.parse(body);
  }
}

module.exports = SSO;
