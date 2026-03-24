import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Home, Send as SendIcon, QrCode, Link as LinkIcon } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Send from './pages/Send'
import Receive from './pages/Receive'
import CreatePayLink from './pages/CreatePayLink'
import ClaimPayLink from './pages/ClaimPayLink'

function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="address-pill" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button 
          onClick={() => disconnect()}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            background: 'var(--bg-hover)',
            color: 'var(--text)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          Disconnect
        </button>
      </div>
    )
  }

  const handleConnect = async () => {
    // Try wagmi connectors first
    if (connectors.length > 0) {
      const connector = connectors[0]
      connect({ connector })
      return
    }
    
    // Fallback: direct window.ethereum call
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        window.location.reload()
      } catch (err) {
        console.error('Failed to connect:', err)
      }
    } else {
      alert('Please install MetaMask to use this app.')
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      style={{
        padding: '0.6rem 1.25rem',
        borderRadius: '0.5rem',
        border: 'none',
        background: 'var(--accent)',
        color: '#000',
        cursor: isPending ? 'wait' : 'pointer',
        fontSize: '0.875rem',
        fontWeight: 700,
      }}
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}

function App() {
  const location = useLocation()
  
  // Hide bottom nav on claim page for a cleaner look
  const hideNav = location.pathname.startsWith('/claim')

  return (
    <div className="layout-container">
      <header className="header">
        <div className="logo">
          <LinkIcon className="logo-icon" size={24} />
          <span>PayShard</span>
        </div>
        <ConnectButton />
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/send" element={<Send />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/paylink" element={<CreatePayLink />} />
          <Route path="/claim/:code" element={<ClaimPayLink />} />
        </Routes>
      </main>

      {!hideNav && (
        <nav className="bottom-nav">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <Home />
            <span>Home</span>
          </Link>
          <Link to="/send" className={`nav-item ${location.pathname === '/send' ? 'active' : ''}`}>
            <SendIcon />
            <span>Send</span>
          </Link>
          <Link to="/receive" className={`nav-item ${location.pathname === '/receive' ? 'active' : ''}`}>
            <QrCode />
            <span>Receive</span>
          </Link>
          <Link to="/paylink" className={`nav-item ${location.pathname === '/paylink' ? 'active' : ''}`}>
            <LinkIcon />
            <span>PayLink</span>
          </Link>
        </nav>
      )}
    </div>
  )
}

export default App
