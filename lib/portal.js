'use strict';

const httpx = require('httpx');

class Portal {
  constructor(opts = {}) {
    this.protocol = opts.protocol || 'https:';
    this.host = opts.host;
    this.accessToken = opts.accessToken;
    this.prefix = `${this.protocol}//${this.host}`;
  }

  async listAccounts(opts = {}) {
    const url = new URL(`${this.prefix}/access-assignments/accounts`);
    if (opts.nextToken) {
      url.searchParams.append('NextToken', opts.nextToken);
    }
    if (opts.maxResults) {
      url.searchParams.append('MaxResults', opts.maxResults);
    }

    const response = await httpx.request(url.toString(), {
      method: 'GET',
      readTimeout: 10000,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${this.accessToken}`
      }
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

  async listAllAccounts() {
    let accounts = [];
    let response = await this.listAccounts();
    accounts = accounts.concat(response.Accounts);

    while (response.IsTruncated) {
      response = await this.listAccounts({
        nextToken: response.NextToken
      });
      accounts = accounts.concat(response.Accounts);
    }
    return accounts;
  }

  async listAccessConfigurationsForAccount(options) {
    const url = new URL(`${this.prefix}/access-assignments/access-configurations`);
    url.searchParams.append('AccountId', options.accountId);
    if (options.nextToken) {
      url.searchParams.append('NextToken', options.nextToken);
    }
    if (options.maxResults) {
      url.searchParams.append('MaxResults', options.maxResults);
    }
    const response = await httpx.request(url.toString(), {
      method: 'GET',
      readTimeout: 10000,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${this.accessToken}`
      }
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

  async listAllAccessConfigurations(options) {
    let configurations = [];
    let response = await this.listAccessConfigurationsForAccount(options);
    configurations = configurations.concat(response.AccessConfigurationsForAccount);

    while (response.IsTruncated) {
      response = await this.listAccessConfigurationsForAccount({
        ...options,
        nextToken: response.NextToken
      });
      configurations = configurations.concat(response.AccessConfigurationsForAccount);
    }
    return configurations;
  }

  async createCloudCredential(options) {
    const url = `${this.prefix}/cloud-credentials`;
    const response = await httpx.request(url, {
      method: 'POST',
      readTimeout: 10000,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${this.accessToken}`
      },
      data: JSON.stringify({
        AccountId: options.accountId,
        AccessConfigurationId: options.accessConfigurationId
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

module.exports = Portal;


