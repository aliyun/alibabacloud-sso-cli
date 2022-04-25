'use strict';

const ProxyAgent = require('proxy-agent');

exports.getProxyAgent = function () {
  if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.NO_PROXY) {
    return new ProxyAgent();
  }

  return null;
};
