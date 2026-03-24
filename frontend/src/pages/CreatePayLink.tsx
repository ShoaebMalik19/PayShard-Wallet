import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { QRCodeSVG } from 'qrcode.react'
import { parseEther, keccak256, toBytes, stringToBytes } from 'viem'
import { Link2 } from 'lucide-react'
import { PAYLINK_ABI, PAYLINK_ADDRESS } from '../config'

export default function CreatePayLink() {
  const [amount, setAmount] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [claimCode, setClaimCode] = useState('')
  
  const { data: hash, error, isPending, writeContract } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return
    
    // In a real app, generate a secure random code
    const rawCode = generateRandomCode()
    
    // Hash the code to store on chain
    const bytes32Code = keccak256(stringToBytes(rawCode))
    
    writeContract({
      address: PAYLINK_ADDRESS as `0x${string}`,
      abi: PAYLINK_ABI,
      functionName: 'createPayLink',
      args: [bytes32Code],
      value: parseEther(amount),
    }, {
      onSuccess: () => {
        setClaimCode(rawCode)
        setGeneratedLink(`${window.location.origin}/claim/${rawCode}`)
      }
    })
  }

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      alert('PayLink copied to clipboard!')
    }
  }

  return (
    <>
      <h2 className="page-title">Create PayLink</h2>
      <p className="page-subtitle">Generate a shareable payment link, like UPI.</p>
      
      {!generatedLink || (!isConfirmed && !isPending) ? (
        <div className="card">
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Amount to Lock (SHM)</label>
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
              style={{ marginTop: '1rem' }}
            >
              <Link2 size={20} />
              {isPending ? 'Confirming...' : 'Generate PayLink'}
            </button>
          </form>
          
          {error && <div style={{ marginTop: '1rem', color: '#ef4444' }}>Error: {(error as any).shortMessage || error.message}</div>}
        </div>
      ) : null}
      
      {isPending || isConfirming ? (
        <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Processing Transaction...</div>
          <p style={{ color: 'var(--text-muted)' }}>Waiting for block confirmation.</p>
        </div>
      ) : null}
      
      {isConfirmed && generatedLink && (
        <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Success!</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your PayLink is ready to be shared with anyone.</p>
          
          <div className="qr-container">
            <QRCodeSVG value={generatedLink} size={180} bgColor="#ffffff" fgColor="#121212" level="L" marginSize={2} />
          </div>
          
          <div className="paylink-box">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Shareable URL</span>
            <div className="paylink-url">
              {generatedLink}
            </div>
            <button className="btn-primary" onClick={copyLink} style={{ padding: '0.75rem' }}>
              Copy Link
            </button>
          </div>
        </div>
      )}
    </>
  )
}
