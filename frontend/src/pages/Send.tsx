import { useState } from 'react'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { Send as SendIcon } from 'lucide-react'

export default function Send() {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  
  const { data: hash, error, isPending, sendTransaction } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !amount) return
    
    sendTransaction({
      to: address as `0x${string}`,
      value: parseEther(amount),
    })
  }

  return (
    <>
      <h2 className="page-title">Send SHM</h2>
      <p className="page-subtitle">Send Shardeum securely and instantly.</p>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Recipient Address</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="0x..." 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount (SHM)</label>
            <input 
              type="number" 
              step="any"
              className="form-input" 
              placeholder="0.0" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isPending || !address || !amount}
            style={{ marginTop: '1rem' }}
          >
            <SendIcon size={20} />
            {isPending ? 'Confirm in Wallet...' : 'Send Now'}
          </button>
        </form>
        
        {hash && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ color: 'var(--text-muted)' }}>Transaction Hash:</div>
            <a 
              href={`https://explorer-mezame.shardeum.org/tx/${hash}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ color: 'var(--accent)', wordBreak: 'break-all', display: 'block', marginTop: '0.5rem' }}
            >
              {hash}
            </a>
          </div>
        )}
        
        {isConfirming && <div style={{ marginTop: '1rem', color: '#f59e0b' }}>Waiting for confirmation...</div>}
        {isConfirmed && <div style={{ marginTop: '1rem', color: 'var(--accent)' }}>Transaction confirmed!</div>}
        {error && <div style={{ marginTop: '1rem', color: '#ef4444' }}>Error: {(error as any).shortMessage || error.message}</div>}
      </div>
    </>
  )
}
