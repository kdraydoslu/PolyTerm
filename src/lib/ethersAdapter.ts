import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { useWalletClient } from 'wagmi'
import { useMemo } from 'react'
import type { Account, Chain, Client, Transport } from 'viem'

export function clientToSigner(client: any) {
  const { account, chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new BrowserProvider(transport, network)
  const signer = new JsonRpcSigner(provider, account.address)
  return signer
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId })
  return useMemo(
    () => (walletClient ? clientToSigner(walletClient) : undefined),
    [walletClient],
  )
}
