import { useState } from 'react'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { Send as SendIcon, ExternalLink } from 'lucide-react'

export default function SendPage() {
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
      <div className="page-header">
        <h1 className="page-title">Send SHM</h1>
        <p className="page-subtitle">Transfer Shardeum tokens securely and instantly.</p>
      </div>

      <div style={{ maxWidth: 560 }}>
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
              style={{ width: '100%', marginTop: '8px' }}
            >
              <SendIcon size={18} />
              {isPending ? 'Confirm in Wallet…' : 'Send Now'}
            </button>
          </form>

          {hash && (
            <div style={{ marginTop: '1.5rem', padding: '16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Transaction Hash</div>
              <a
                href={`https://explorer-mezame.shardeum.org/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent)', wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {hash} <ExternalLink size={12} />
              </a>
            </div>
          )}

          {isConfirming && <p style={{ marginTop: '1rem', color: 'var(--warning)' }}>Waiting for confirmation…</p>}
          {isConfirmed && <p style={{ marginTop: '1rem', color: 'var(--accent)' }}>✓ Transaction confirmed!</p>}
          {error && <p style={{ marginTop: '1rem', color: 'var(--danger)' }}>Error: {(error as any).shortMessage || error.message}</p>}
        </div>
      </div>
    </>
  )
}
