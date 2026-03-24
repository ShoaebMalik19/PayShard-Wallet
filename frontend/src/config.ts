export const PAYLINK_ADDRESS = '0x5Cd33259086699B08c44860B7Dad067048f1CF72' // Deployed on Shardeum Testnet (2026-03-24)

export const PAYLINK_ABI = [
  {
    "type": "function",
    "name": "createPayLink",
    "inputs": [{ "name": "code", "type": "bytes32" }],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "claim",
    "inputs": [{ "name": "code", "type": "bytes32" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "links",
    "inputs": [{ "name": "code", "type": "bytes32" }],
    "outputs": [
      { "name": "creator", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "claimed", "type": "bool" }
    ],
    "stateMutability": "view"
  }
] as const
