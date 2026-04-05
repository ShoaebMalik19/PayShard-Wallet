import { useState } from 'react'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { Send as SendIcon, ExternalLink, ArrowUpRight } from 'lucide-react'

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
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Send SHM</h1>
        <p className="page-subtitle">Transfer Shardeum tokens securely and instantly.</p>
      </div>

      <div className="send-centered">
        <div className="card" style={{ maxWidth: 520, width: '100%' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <ArrowUpRight size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--accent)' }} />
                Transfer Details
              </div>
              <div className="card-subtitle">Enter the recipient address and amount to send</div>
            </div>
          </div>

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
              <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transaction Hash</div>
              <a
                href={`https://explorer-mezame.shardeum.org/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent)', wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {hash} <ExternalLink size={12} />
              </a>
            </div>
          )}

          {isConfirming && <p style={{ marginTop: '1rem', color: 'var(--warning)' }}>Waiting for confirmation…</p>}
          {isConfirmed && <p style={{ marginTop: '1rem', color: 'var(--accent)', fontWeight: 600 }}>✓ Transaction confirmed!</p>}
          {error && <p style={{ marginTop: '1rem', color: 'var(--danger)' }}>Error: {(error as any).shortMessage || error.message}</p>}
        </div>
      </div>
    </>
  )
}
