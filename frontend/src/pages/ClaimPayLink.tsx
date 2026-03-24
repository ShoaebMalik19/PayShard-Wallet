import { useParams } from 'react-router-dom'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256, toHex } from 'viem'
import { Zap, ExternalLink, Gift } from 'lucide-react'
import { PAYLINK_ADDRESS, PAYLINK_ABI } from '../config'

export default function ClaimPayLink() {
  const { code } = useParams<{ code: string }>()
  const codeHash = code ? keccak256(toHex(code)) : '0x'

  const { data: hash, isPending, writeContract, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const handleClaim = () => {
    writeContract({
      address: PAYLINK_ADDRESS as `0x${string}`,
      abi: PAYLINK_ABI,
      functionName: 'claim',
      args: [codeHash],
    })
  }

  return (
    <div className="claim-container fade-in">
      <div className="card" style={{ textAlign: 'center', padding: '48px 36px' }}>
        <Gift size={48} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
          Claim Your SHM
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Someone sent you Shardeum tokens via PayLink!
        </p>

        <div style={{ marginBottom: '1.5rem', padding: '14px 20px', background: 'var(--bg-hover)', borderRadius: 'var(--radius)', display: 'inline-block' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PayLink Code</span>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', color: 'var(--accent)', marginTop: 4 }}>{code}</div>
        </div>

        {!isConfirmed ? (
          <button
            onClick={handleClaim}
            className="btn-primary"
            disabled={isPending || isConfirming}
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
    </div>
  )
}
