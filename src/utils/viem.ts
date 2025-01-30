import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: http(),
})

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
})


const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x`)

export async function pay() {
  try {
    const amount = parseEther("0.00001")
    const hash = await walletClient.sendTransaction({
      account,
      to: '0xaD73eafCAc4F4c6755DFc61770875fb8B6bC8A25',
      value: amount
    })
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: hash
    })
    return receipt
  } catch (error) {
    console.log(error)
    return
  }
}
