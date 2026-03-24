export const PAYLINK_ADDRESS = '0xeEDDa8bCdF826DE16356719F22010B0d4736c81A' // Deployed on Shardeum Testnet

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
