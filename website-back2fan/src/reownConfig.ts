
import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { chiliz } from '@reown/appkit/networks'
import type { Chain } from 'viem'

// Use o Project ID fornecido (não do env)
export const projectId = 'f3a81e688e57fb8aa9a24ec79b7aac8d'

// Apenas Chiliz como rede válida
export const networks: [Chain] = [chiliz as Chain]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: false, // no SSR para Vite/SPA
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
