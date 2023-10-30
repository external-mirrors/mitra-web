// Currency code; currency name; payment URI scheme
const CRYPTOCURRENCIES = [
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

export interface Currency {
  code: string,
  name: string,
}

export const MONERO = { code: "XMR", name: "Monero" }
export const ETHEREUM = { code: "ETH", name: "Ethereum" }

export function getCurrencyByLabel(label: string): Currency | null {
  const currency = CRYPTOCURRENCIES.find(([code]) => {
    return `$${code}` === label.toUpperCase()
  })
  if (currency) {
    return { code: currency[0], name: currency[1] }
  }
  if (["lightning address", "lud16"].includes(label.toLowerCase())) {
    return { code: "LN", name: "Bitcoin Lightning" }
  }
  return null
}

export function isEthereumChain(chainId: string): boolean {
  return chainId.startsWith("eip155")
}

export function isMoneroChain(chainId: string): boolean {
  return chainId.startsWith("monero")
}
