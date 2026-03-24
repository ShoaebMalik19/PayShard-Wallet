import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, keccak256, toHex } from 'viem'
import { QRCodeSVG } from 'qrcode.react'
import { Link2, Copy, CheckCircle, Zap, ExternalLink } from 'lucide-react'
import { PAYLINK_ADDRESS, PAYLINK_ABI } from '../config'

export default function CreatePayLink() {
  const [amount, setAmount] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  const { data: hash, isPending, writeContract } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return

    const randomCode = Math.random().toString(36).substring(2, 10)
    const codeHash = keccak256(toHex(randomCode))
    setCode(randomCode)

    writeContract({
      address: PAYLINK_ADDRESS as `0x${string}`,
      abi: PAYLINK_ABI,
      functionName: 'createPayLink',
      args: [codeHash],
      value: parseEther(amount),
    })

    setGeneratedLink(`${window.location.origin}/claim/${randomCode}`)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Create PayLink</h1>
        <p className="page-subtitle">Generate a shareable link that lets anyone claim SHM instantly — no address needed.</p>
      </div>

      <div className="split-layout">
        {/* Left: Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><Zap size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />New PayLink</div>
              <div className="card-subtitle">Funds are locked in the contract until claimed</div>
            </div>
          </div>

          <form onSubmit={handleCreate}>
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
              disabled={isPending || !amount}
              style={{ width: '100%' }}
            >
              <Link2 size={18} />
              {isPending ? 'Confirm in Wallet…' : 'Generate PayLink'}
            </button>
          </form>

          {isConfirming && <p style={{ marginTop: '1rem', color: 'var(--warning)' }}>Confirming transaction…</p>}
          {hash && (
            <div style={{ marginTop: '1rem', padding: '12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius)', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tx: </span>
              <a href={`https://explorer-mezame.shardeum.org/tx/${hash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', wordBreak: 'break-all' }}>
                {String(hash).slice(0, 20)}… <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          {generatedLink ? (
            <>
              <div style={{ marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isConfirmed ? '✓ PayLink is live!' : 'PayLink Preview'}
              </div>

              <div className="qr-container" style={{ marginBottom: '1.5rem' }}>
                <QRCodeSVG
                  value={generatedLink}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#121212"
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--accent)', wordBreak: 'break-all', textAlign: 'center', marginBottom: 12 }}>
                {generatedLink}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={copyLink} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                  {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                </button>
              </div>

              {amount && <div style={{ marginTop: 16, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Amount: <strong>{amount} SHM</strong></div>}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <Link2 size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '0.9rem' }}>Enter an amount and generate your PayLink.</p>
              <p style={{ fontSize: '0.8rem', marginTop: 4 }}>A QR code and shareable link will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
