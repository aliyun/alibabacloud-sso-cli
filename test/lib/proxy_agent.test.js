import { deepStrictEqual, notDeepStrictEqual } from 'assert';

import { getProxyAgent } from '../../lib/proxy_agent.js';

describe('lib/proxy_agent', function() {
  it('should ok', async function () {
    const agent = getProxyAgent();
    deepStrictEqual(agent, null);
  });

  it('should ok with proxy', async function () {
    process.env.HTTP_PROXY = 'mock';
    const agent = getProxyAgent();
    notDeepStrictEqual(agent, null);
    deepStrictEqual(typeof agent.createSocket, 'function');
    process.env.HTTP_PROXY = '';
  });
});
