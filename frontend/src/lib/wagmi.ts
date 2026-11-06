import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { sepolia, polygonAmoy } from 'wagmi/chains'
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets'

export const config = getDefaultConfig({
  appName: 'BlueCred',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'local-only',
  ssr: true,
  // The browser wallet requires no relay account or automatic WalletConnect requests.
  wallets: [{ groupName: 'Browser wallets', wallets: [injectedWallet] }],
  chains: [sepolia, polygonAmoy],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'http://127.0.0.1:8545'),
    [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_AMOY_RPC_URL || 'http://127.0.0.1:8545')
  }
})
