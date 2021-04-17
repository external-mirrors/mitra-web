// Currency code; currency name; payment URI scheme
export const CRYPTOCURRENCIES = [
  // https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki
  ["BTC", "Bitcoin", "bitcoin"],

  // https://bitcoincashstandards.org/
  ["BCH", "Bitcoin Cash", "bitcoincash"],

  ["DASH", "Dash", "dash"],
  ["DOGE", "Dogecoin", "dogecoin"],

  // https://eips.ethereum.org/EIPS/eip-681
  // Not supported by MetaMask https://github.com/MetaMask/metamask-extension/issues/5125
  ["ETH", "Ethereum", "ethereum"],

  // https://electrum-ltc.org/litecoin_URIs.html
  ["LTC", "Litecoin", "litecoin"],

  // https://github.com/monero-project/monero/wiki/URI-Formatting
  ["XMR", "Monero", "monero"],

  // https://zips.z.cash/zip-0321
  ["ZEC", "Zcash", "zcash"],
]
