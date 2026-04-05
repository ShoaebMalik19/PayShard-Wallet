import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect } from 'wagmi'
import { keccak256, toHex } from 'viem'
import { Zap, ExternalLink, Gift, Shield, Lock, Eye, EyeOff, Wallet } from 'lucide-react'
import { PAYLINK_ADDRESS, PAYLINK_ABI } from '../config'
import { LiquidButton } from '@/components/ui/liquid-glass-button'

export default function ClaimPayLink() {
  const { code } = useParams<{ code: string }>()
  const codeHash = code ? keccak256(toHex(code)) : '0x'

  const { isConnected } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()

  const [passkey, setPasskey] = useState('')
  const [showPasskey, setShowPasskey] = useState(false)

  const { data: hash, isPending, writeContract, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const isValidPasskey = passkey.replace(/\s/g, '').length === 16

  const handleClaim = () => {
    const cleanPasskey = passkey.replace(/\s/g, '')
    writeContract({
      address: PAYLINK_ADDRESS as `0x${string}`,
      abi: PAYLINK_ABI,
      functionName: 'claim',
      args: [codeHash, cleanPasskey],
    })
  }

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] })
    }
  }

  const handlePasskeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d\s]/g, '')
    setPasskey(raw)
  }

  return (
    <div className="fade-in">
      {/* Branding header for claim page */}
      <div style={{
        textAlign: 'center',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}>
        <Zap size={24} color="var(--accent)" />
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>PayShard</span>
      </div>

      <div className="card" style={{
        textAlign: 'center',
        padding: '44px 32px',
        border: '1px solid rgba(0, 209, 102, 0.12)',
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0, 209, 102, 0.15), rgba(0, 209, 102, 0.05))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <Gift size={32} color="var(--accent)" />
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
          Claim Your SHM
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: 320, margin: '0 auto 2rem' }}>
          Someone sent you Shardeum tokens via PayLink. Enter the passkey to claim.
        </p>

        {/* PayLink Code badge */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '12px 20px',
          background: 'var(--bg-hover)',
          borderRadius: 'var(--radius)',
          display: 'inline-block',
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>PayLink Code</span>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.05rem', color: 'var(--accent)', marginTop: 4 }}>{code}</div>
        </div>

        {/* Passkey Input */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(0, 209, 102, 0.06), rgba(0, 209, 102, 0.01))',
          border: '1px solid rgba(0, 209, 102, 0.2)',
          borderRadius: 'var(--radius)',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Shield size={16} color="var(--accent)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Enter Passkey
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type={showPasskey ? 'text' : 'password'}
              value={passkey}
              onChange={handlePasskeyChange}
              placeholder="Enter 16-digit passkey"
              maxLength={19}
              style={{
                width: '100%',
                padding: '14px 44px',
                background: 'var(--bg-card)',
                border: `1px solid ${isValidPasskey ? 'rgba(0, 209, 102, 0.5)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '1.05rem',
                letterSpacing: '0.15em',
                color: '#fff',
                textAlign: 'center',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => setShowPasskey(!showPasskey)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: 'var(--text-muted)',
              }}
              title={showPasskey ? 'Hide passkey' : 'Show passkey'}
              type="button"
            >
              {showPasskey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {passkey.length > 0 && !isValidPasskey && (
            <p style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--warning, #f59e0b)' }}>
              Passkey must be exactly 16 digits
            </p>
          )}
          {isValidPasskey && (
            <p style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--accent)' }}>
              ✓ Passkey ready
            </p>
          )}
        </div>

        {/* Action button */}
        {!isConnected ? (
          <LiquidButton
            onClick={handleConnect}
            disabled={isConnecting}
            className="connect-glass-btn"
            size="xl"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Wallet size={18} />
            {isConnecting ? 'Connecting…' : 'Connect Wallet to Claim'}
          </LiquidButton>
        ) : !isConfirmed ? (
          <button
            onClick={handleClaim}
            className="btn-primary"
            disabled={isPending || isConfirming || !isValidPasskey}
            style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
          >
            <Zap size={20} />
            {isPending ? 'Confirm in Wallet…' : isConfirming ? 'Claiming…' : 'Claim Now'}
          </button>
        ) : (
          <div className="paylink-box" style={{ marginTop: 0 }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
              ✓ Claimed Successfully!
            </p>
            <a
              href={`https://explorer-mezame.shardeum.org/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              View Transaction <ExternalLink size={12} />
            </a>
          </div>
        )}

        {error && (
          <p style={{ marginTop: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
            {(error as any).shortMessage || error.message}
          </p>
        )}
      </div>

      {/* Footer attribution */}
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Powered by <span style={{ color: 'var(--accent)', fontWeight: 600 }}>PayShard</span> on Shardeum
      </div>
    </div>
  )
}
