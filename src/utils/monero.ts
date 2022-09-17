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
