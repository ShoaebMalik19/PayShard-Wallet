import { useAccount } from 'wagmi'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, CheckCircle, QrCode, Wallet } from 'lucide-react'
import { useState } from 'react'

export default function Receive() {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!address) {
    return (
      <>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1 className="page-title">Receive SHM</h1>
          <p className="page-subtitle">Share your address or QR code to receive Shardeum tokens.</p>
        </div>
        <div className="empty-state-center">
          <div className="card" style={{ maxWidth: 420, width: '100%', textAlign: 'center', padding: '48px 32px' }}>
            <Wallet size={48} color="var(--accent)" style={{ marginBottom: '1.25rem', opacity: 0.6 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Connect your wallet to generate<br />a receive address and QR code.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Receive SHM</h1>
        <p className="page-subtitle">Share your address or QR code to receive Shardeum tokens.</p>
      </div>

      <div className="receive-center">
        <div className="card" style={{ maxWidth: 460, width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div className="qr-container">
              <QRCodeSVG
                value={address}
                size={200}
                bgColor="#ffffff"
                fgColor="#121212"
                level="H"
                includeMargin={false}
              />
            </div>

            <div style={{ width: '100%' }}>
              <label className="form-label" style={{ marginBottom: 8, display: 'block', textAlign: 'left' }}>Your Wallet Address</label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 14px',
                background: 'var(--bg-hover)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}>
                <span style={{
                  flex: 1,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  wordBreak: 'break-all',
                }}>
                  {address}
                </span>
                <button
                  onClick={copyAddress}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', flexShrink: 0 }}
                >
                  {copied ? <><CheckCircle size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
