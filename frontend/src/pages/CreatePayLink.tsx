import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, keccak256, toHex, encodePacked } from 'viem'
import { QRCodeSVG } from 'qrcode.react'
import { Link2, Copy, CheckCircle, Zap, ExternalLink, Shield, Eye, EyeOff, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { PAYLINK_ADDRESS, PAYLINK_ABI } from '../config'
import { usePayLinkHistory } from '../hooks/usePayLinkHistory'
import type { PayLinkRecord } from '../hooks/usePayLinkHistory'

/** Generate a cryptographically random 16-digit numeric passkey */
function generatePasskey(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => (b % 10).toString())
    .join('')
}

/** Format passkey as "1234 5678 9012 3456" */
function formatPasskey(pk: string): string {
  return pk.replace(/(.{4})/g, '$1 ').trim()
}

/** Format timestamp to readable date */
function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CreatePayLink() {
  const [amount, setAmount] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [code, setCode] = useState('')
  const [passkey, setPasskey] = useState('')
  const [copied, setCopied] = useState(false)
  const [passkeyCopied, setPasskeyCopied] = useState(false)
  const [showPasskey, setShowPasskey] = useState(false)

  const { history, addRecord, updateStatus, deleteRecord, clearHistory } = usePayLinkHistory()

  const { data: hash, isPending, writeContract } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Save to history when transaction is initiated
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return

    const randomCode = Math.random().toString(36).substring(2, 10)
    const codeHash = keccak256(toHex(randomCode))

    const newPasskey = generatePasskey()
    const passkeyHash = keccak256(encodePacked(['string'], [newPasskey]))

    setCode(randomCode)
    setPasskey(newPasskey)

    const link = `${window.location.origin}/claim/${randomCode}`
    setGeneratedLink(link)

    // Save record to history
    addRecord({
      code: randomCode,
      passkey: newPasskey,
      amount,
      link,
      txHash: '',
      status: 'pending',
    })

    writeContract({
      address: PAYLINK_ADDRESS as `0x${string}`,
      abi: PAYLINK_ABI,
      functionName: 'createPayLink',
      args: [codeHash, passkeyHash],
      value: parseEther(amount),
    })
  }

  // Update status when confirmed
  useEffect(() => {
    if (isConfirmed && code && hash) {
      updateStatus(code, 'confirmed', hash as string)
    }
  }, [isConfirmed, code, hash, updateStatus])

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyPasskey = () => {
    navigator.clipboard.writeText(passkey)
    setPasskeyCopied(true)
    setTimeout(() => setPasskeyCopied(false), 2000)
  }

  const formattedPasskeyDisplay = passkey.replace(/(.{4})/g, '$1 ').trim()

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Create PayLink</h1>
        <p className="page-subtitle">Generate a shareable link that lets anyone claim SHM instantly — protected by a 16-digit passkey.</p>
      </div>

      <div className="split-layout">
        {/* Left: Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><Zap size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />New PayLink</div>
              <div className="card-subtitle">Funds are locked in the contract until claimed with the correct passkey</div>
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

          {/* Passkey Display */}
          {passkey && (
            <div style={{
              marginTop: '1.25rem',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(0, 209, 102, 0.08), rgba(0, 209, 102, 0.02))',
              border: '1px solid rgba(0, 209, 102, 0.25)',
              borderRadius: 'var(--radius)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Shield size={16} color="var(--accent)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Passkey — share separately
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '1.1rem',
                letterSpacing: '0.12em',
                color: '#fff',
              }}>
                <span style={{ flex: 1, userSelect: showPasskey ? 'text' : 'none' }}>
                  {showPasskey ? formattedPasskeyDisplay : '•••• •••• •••• ••••'}
                </span>
                <button
                  onClick={() => setShowPasskey(!showPasskey)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}
                  title={showPasskey ? 'Hide passkey' : 'Show passkey'}
                  type="button"
                >
                  {showPasskey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={copyPasskey}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--accent)' }}
                  title="Copy passkey"
                  type="button"
                >
                  {passkeyCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <p style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                ⚠ The recipient needs this passkey to claim the funds. Share it through a different channel than the link for best security.
              </p>
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

              {passkey && (
                <div style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  background: 'rgba(0, 209, 102, 0.08)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.8rem',
                  color: 'var(--accent)',
                }}>
                  <Shield size={14} />
                  Passkey-protected
                </div>
              )}
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

      {/* ═════════════════════════════════════════════════════
          PAYLINK HISTORY
         ═════════════════════════════════════════════════════ */}
      <div className="card" style={{ marginTop: 28 }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={18} color="var(--accent)" />
            <div>
              <div className="card-title">PayLink History</div>
              <div className="card-subtitle">{history.length} PayLink{history.length !== 1 ? 's' : ''} created</div>
            </div>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.78rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
            >
              <Trash2 size={13} />
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Clock size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p style={{ fontSize: '0.9rem' }}>No PayLinks created yet.</p>
            <p style={{ fontSize: '0.8rem', marginTop: 4 }}>Your PayLink history will appear here with passkeys stored safely.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map((record) => (
              <HistoryRow key={record.id} record={record} onDelete={deleteRecord} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* ──────────────────────────────────────────────────────────── */
/*  History Row Component                                      */
/* ──────────────────────────────────────────────────────────── */
function HistoryRow({ record, onDelete }: { record: PayLinkRecord; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [showPk, setShowPk] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', label: 'Pending' },
    confirmed: { bg: 'rgba(0, 209, 102, 0.12)', text: '#00D166', label: 'Active' },
    claimed: { bg: 'rgba(100, 100, 120, 0.12)', text: '#6b6b80', label: 'Claimed' },
  }

  const s = statusColors[record.status] || statusColors.pending

  return (
    <div style={{
      background: 'var(--bg-hover)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Summary row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          alignItems: 'center',
          gap: 16,
          padding: '14px 18px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {record.amount} <span style={{ color: 'var(--accent)', fontWeight: 700 }}>SHM</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {formatDate(record.createdAt)}
          </div>
        </div>

        <div style={{
          padding: '4px 10px',
          borderRadius: 20,
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          background: s.bg,
          color: s.text,
        }}>
          {s.label}
        </div>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {record.code}
        </div>

        {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          padding: '0 18px 16px',
          borderTop: '1px solid var(--border)',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          {/* Link */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Claim Link
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius)',
            }}>
              <span style={{
                flex: 1,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.75rem',
                color: 'var(--accent)',
                wordBreak: 'break-all',
              }}>
                {record.link}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); copy(record.link, `link-${record.id}`) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--accent)', flexShrink: 0 }}
                title="Copy link"
              >
                {copiedField === `link-${record.id}` ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Passkey */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Shield size={12} color="var(--accent)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Passkey
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius)',
              border: '1px solid rgba(0, 209, 102, 0.15)',
            }}>
              <span style={{
                flex: 1,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                color: '#fff',
                userSelect: showPk ? 'text' : 'none',
              }}>
                {showPk ? formatPasskey(record.passkey) : '•••• •••• •••• ••••'}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowPk(!showPk) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', flexShrink: 0 }}
                title={showPk ? 'Hide' : 'Show'}
              >
                {showPk ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); copy(record.passkey, `pk-${record.id}`) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--accent)', flexShrink: 0 }}
                title="Copy passkey"
              >
                {copiedField === `pk-${record.id}` ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Tx Hash */}
          {record.txHash && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Transaction
              </div>
              <a
                href={`https://explorer-mezame.shardeum.org/tx/${record.txHash}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  color: 'var(--accent)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {record.txHash.slice(0, 16)}…{record.txHash.slice(-8)}
                <ExternalLink size={10} />
              </a>
            </div>
          )}

          {/* Delete button */}
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(record.id) }}
              style={{
                background: 'none',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius)',
                padding: '6px 14px',
                color: 'var(--danger)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
