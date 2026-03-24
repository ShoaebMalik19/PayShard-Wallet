import { useParams } from 'react-router-dom'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256, stringToBytes } from 'viem'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { PAYLINK_ABI, PAYLINK_ADDRESS } from '../config'

export default function ClaimPayLink() {
  const { code } = useParams<{ code: string }>()
  const bytes32Code = code ? keccak256(stringToBytes(code)) : undefined
  
  const { data: linkData, isError: readError, isLoading: readLoading } = useReadContract(
    bytes32Code ? {
      address: PAYLINK_ADDRESS as `0x${string}`,
      abi: PAYLINK_ABI,
      functionName: 'links',
      args: [bytes32Code],
    } : undefined
  )
  
  const { data: hash, isPending, writeContract } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const handleClaim = () => {
    if (!bytes32Code) return
    
    writeContract({
      address: PAYLINK_ADDRESS as `0x${string}`,
      abi: PAYLINK_ABI,
      functionName: 'claim',
      args: [bytes32Code],
    })
  }

  if (readLoading || isConfirming) {
    return (
      <div className="flex-center" style={{ marginTop: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>{isConfirming ? 'Processing claim...' : 'Loading PayLink data...'}</p>
      </div>
    )
  }

  if (readError || !linkData) {
    return (
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem', display: 'inline-block' }} />
        <h3 style={{ marginBottom: '1rem' }}>Invalid PayLink</h3>
        <p style={{ color: 'var(--text-muted)' }}>This payment link might be incorrect or expired.</p>
      </div>
    )
  }

  // Check the structure of the struct returned. For ethers v5/viem, mapping with struct returns array/tuple of values in order.
  const [creator, amountWei, claimed] = linkData as [string, bigint, boolean]
  const amountEth = amountWei ? (Number(amountWei) / 1e18).toFixed(4) : '0'

  if (claimed) {
    return (
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="#f59e0b" style={{ marginBottom: '1rem', display: 'inline-block' }} />
        <h3 style={{ marginBottom: '1rem' }}>Already Claimed</h3>
        <p style={{ color: 'var(--text-muted)' }}>This PayLink has already been claimed by someone.</p>
      </div>
    )
  }

  if (isConfirmed) {
    return (
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center', backgroundColor: 'rgba(0, 209, 102, 0.1)', borderColor: 'var(--accent)' }}>
        <CheckCircle size={48} color="var(--accent)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
        <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Successfully Claimed!</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You have received {amountEth} SHM to your wallet.</p>
      </div>
    )
  }

  return (
    <>
      <h2 className="page-title" style={{ textAlign: 'center', marginTop: '2rem' }}>You've Received SHM!</h2>
      <p className="page-subtitle" style={{ textAlign: 'center' }}>Connect your wallet and claim your funds instantly.</p>
      
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ padding: '2rem 0', backgroundColor: 'var(--bg-hover)', borderRadius: '1rem', marginBottom: '2rem' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Amount to Claim</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)' }}>
            {amountEth} <span style={{ fontSize: '1.5rem' }}>SHM</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            From: <span className="address-pill">{creator.slice(0, 6)}...{creator.slice(-4)}</span>
          </div>
        </div>
        
        <button 
          className="btn-primary" 
          onClick={handleClaim} 
          disabled={isPending || claimed}
          style={{ padding: '1.25rem' }}
        >
          {isPending ? 'Confirming in wallet...' : 'Claim Now (0 Gas)'}
        </button>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          *Gas is sponsored by PayShard Demo Paymaster
        </p>
      </div>
    </>
  )
}
