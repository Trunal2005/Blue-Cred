import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { sepolia, polygonAmoy } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'BlueCred',
  projectId: 'bluecred-carbon-credit', // WalletConnect project ID placeholder
  chains: [sepolia, polygonAmoy],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/ZlbSJaKmzTwCD9g_niu--k3nU9_xRSrX'),
    [polygonAmoy.id]: http()
  }
})