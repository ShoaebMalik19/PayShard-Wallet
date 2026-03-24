import { useAccount } from 'wagmi'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Wallet } from 'lucide-react'

export default function Receive() {
  const { address, isConnected } = useAccount()

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      alert('Address copied to clipboard!')
    }
  }

  if (!isConnected) {
    return (
      <div className="flex-center" style={{ marginTop: '2rem' }}>
        <p>Please connect your wallet first to see your receive address.</p>
      </div>
    )
  }

  return (
    <div className="flex-center">
      <h2 className="page-title" style={{ alignSelf: 'flex-start' }}>Receive SHM</h2>
      <p className="page-subtitle" style={{ alignSelf: 'flex-start' }}>Show this QR code to receive funds securely.</p>
      
      <div className="card" style={{ width: '100%', textAlign: 'center' }}>
        <div className="qr-container" style={{ margin: '1rem auto' }}>
          <QRCodeSVG value={address || ''} size={200} bgColor="#ffffff" fgColor="#121212" level="L" marginSize={2} />
        </div>
        
        <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Wallet Address</span>
        </div>
        <div className="address-pill" style={{ display: 'inline-flex', padding: '0.75rem 1.25rem' }}>
          {address?.slice(0, 10)}...{address?.slice(-8)}
          <button 
            onClick={copyAddress} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              marginLeft: '0.5rem' 
            }}
          >
            <Copy size={16} />
          </button>
        </div>
        
        <button className="btn-primary" onClick={copyAddress} style={{ marginTop: '2rem' }}>
          Copy Full Address
        </button>
      </div>
    </div>
  )
}
