/*==================================================
  Modules
  ==================================================*/

  const _ = require('underscore')
  const axios = require("axios");
  const sdk = require('../../sdk');

/*==================================================
  Settings
  ==================================================*/

  const sablierAddresses = {
      "v1.0.0": "0xA4fc358455Febe425536fd1878bE67FfDBDEC59a",
      "v1.1.0": "0xCD18eAa163733Da39c232722cBC4E8940b1D8888",
  };

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
    const result = await axios({
        url: "https://api.thegraph.com/subgraphs/name/sablierhq/sablier",
        method: "post",
        data: {
            query: `
                query AllTokens {
                    tokens {
                    id
                    }
                }
            `
        }
        });
    let allTokens = result.data.data.tokens;
    allTokens = allTokens.map(token => token.id);

    const balances = {
        '0x0000000000000000000000000000000000000000': 0
    };

    const calls = [];
    _.each(allTokens, (token) => {
        calls.push(
            {
                target: token,
                params: sablierAddresses["v1.0.0"]
            },
            {
                target: token,
                params: sablierAddresses["v1.1.0"]
            }
        );
    });

    const balanceOfResults = await sdk.api.abi.multiCall({
        block,
        calls,
        abi: 'erc20:balanceOf',
    });

    await sdk.util.sumMultiBalanceOf(balances, balanceOfResults);

    return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: 'Sablier',
  token: null,
  category: 'Payments',
  start: 1573582731,
  tvl,
};
