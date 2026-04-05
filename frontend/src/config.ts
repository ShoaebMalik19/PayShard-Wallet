export const PAYLINK_ADDRESS = '0x1c9fDeA37Fc0548422FC9cCD377053e2d004664E' // Deployed on Shardeum Testnet (2026-04-04) — with passkey security

export const PAYLINK_ABI = [
  {
    "type": "function",
    "name": "createPayLink",
    "inputs": [
      { "name": "code", "type": "bytes32" },
      { "name": "_passkeyHash", "type": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "claim",
    "inputs": [
      { "name": "code", "type": "bytes32" },
      { "name": "passkey", "type": "string" }
    ],
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
      { "name": "claimed", "type": "bool" },
      { "name": "passkeyHash", "type": "bytes32" }
    ],
    "stateMutability": "view"
  }
] as const
