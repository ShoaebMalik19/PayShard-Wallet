import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

export const shardeumMainnet = defineChain({
  id: 8119,
  name: 'Shardeum Testnet (Mezame)',
  nativeCurrency: { name: 'Shardeum', symbol: 'SHM', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api-mezame.shardeum.org'] },
  },
  blockExplorers: {
    default: { name: 'Shardeum Explorer', url: 'https://explorer-mezame.shardeum.org' },
  },
})

const config = createConfig({
  chains: [shardeumMainnet],
  transports: {
    [shardeumMainnet.id]: http(),
  },
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
