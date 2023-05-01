import { generateRandomString } from "./ethereum"

// https://github.com/monero-project/monero/wiki/URI-Formatting
export function createMoneroPaymentUri(
  address: string,
  amount?: number,
): string {
  let paymentUri = `monero:${address}`
  if (amount) {
    paymentUri += `?tx_amount=${amount}`
  }
  return paymentUri
}

export function createMoneroCaip122Message(
  address: string,
  domain: string,
  statement: string,
): string {
  const uri = window.location.origin
  const nonce = generateRandomString(16)
  const issuedAt = new Date().toISOString()
  const message = `${domain} wants you to sign in with your Monero account:
${address}

${statement}

URI: ${uri}
Version: 1
Nonce: ${nonce}
Issued At: ${issuedAt}`

  return message
}
