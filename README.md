# PayShard Wallet

![PayShard Banner](https://via.placeholder.com/800x200.png?text=PayShard+Wallet+-+Next-Gen+Shardeum+Wallet)

PayShard is a next-generation Shardeum wallet built for the **PayFiHackathon**. 
It focuses on frictionless UX, mobile-first design, and the killer feature: **PayLinks** — shareable, gasless payment links that feel like web2 UPI.

## 🌟 Why This Wins the Hackathon

1. **Frictionless Onboarding**: Users can claim SHM via a simple URL `/claim/[code]`.
2. **UPI-Style UX**: Web3 wallets are often too clunky. PayShard is mobile-first, installable as a PWA, and uses beautiful UI with green accents akin to modern fintech apps.
3. **Smart Contract Powered**: Complete decentralization with a custom `PayLink.sol` escrow to safely lock and claim funds.
4. **0 Gas Demo Paymaster**: Gas sponsorship makes claiming completely free for the end user.
5. **Shardeum Native**: Optimized for Shardeum's incredibly fast finality and low transaction fees, fully pre-configured to `Shardeum Mainnet`.

---

## 🏗 Architecture Diagram

```mermaid
graph TD
    A[User Wallet/Creator] -->|Lock SHM| B(PayLink Smart Contract)
    B -->|Generate Code & URL| C[Shareable PayLink URL]
    C -->|Send via WhatsApp/Telegram| D[Recipient]
    D -->|Click Link| E(PayShard Claim UI)
    E -->|Call claim() via Paymaster| B
    B -->|Transfer SHM| D
```

---

## 🎥 Demo Video

[![PayShard Demo](https://via.placeholder.com/800x400.png?text=Click+to+Watch+Demo+Video)](https://youtube.com/placeholder)

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js > 18
- Hardhat
- MetaMask or any Web3 Wallet

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

2. **Deploy Smart Contracts**
   Compile and deploy the `PayLink` and `DemoPaymaster` contracts to Shardeum Mainnet.
   ```bash
   npx hardhat compile
   # Fill out .env with your PRIVATE_KEY and RPC first!
   npm run deploy:mainnet
   ```

3. **Run the DApp**
   ```bash
   npm run dev
   ```
   This will start the Vite server for the frontend at `http://localhost:5173`.

---

## 🛠 Tech Stack

- **Blockchain**: Shardeum Mainnet (Chain ID: 8118)
- **Smart Contracts**: Solidity ^0.8.24, Hardhat
- **Frontend**: React, Vite, TypeScript
- **Web3 Integration**: Wagmi, Viem, RainbowKit
- **Styling**: Vanilla CSS, Lucide Icons
- **PWA**: vite-plugin-pwa

---

Built with ❤️ for the Shardeum Ecosystem.
