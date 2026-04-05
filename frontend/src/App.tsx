import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { Home, Send as SendIcon, QrCode, Link2, Menu, X, Zap, Wallet } from 'lucide-react'
import ShaderBackground from '@/components/ui/shader-background'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import Dashboard from './pages/Dashboard'
import SendPage from './pages/Send'
import Receive from './pages/Receive'
import CreatePayLink from './pages/CreatePayLink'
import ClaimPayLink from './pages/ClaimPayLink'

function App() {
  const location = useLocation()
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isClaim = location.pathname.startsWith('/claim')

  const handleConnect = async () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] })
      return
    }
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

  const navItems = [
    { to: '/', icon: <Home />, label: 'Dashboard' },
    { to: '/send', icon: <SendIcon />, label: 'Send' },
    { to: '/receive', icon: <QrCode />, label: 'Receive' },
    { to: '/paylink', icon: <Link2 />, label: 'PayLinks' },
  ]

  // Claim page: render without sidebar, truly centered
  if (isClaim) {
    return (
      <>
        <ShaderBackground />
        <div className="claim-wrapper" style={{ position: 'relative', zIndex: 1 }}>
          <div className="claim-container">
            <Routes>
              <Route path="/claim/:code" element={<ClaimPayLink />} />
            </Routes>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ShaderBackground />

      {/* Mobile hamburger */}
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Zap size={22} />
          <span>PayShard</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${location.pathname === item.to ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-network">
            <span className="dot" />
            Shardeum Testnet
          </div>
        </div>
      </aside>

      {/* Top bar */}
      <header className="topbar">
        {isConnected && address ? (
          <>
            <div className="topbar-balance">
              {balance ? (Number(balance.value) / 1e18).toFixed(4) : '0.0000'}
              <span className="symbol">SHM</span>
            </div>
            <div
              className="topbar-address"
              onClick={() => {
                navigator.clipboard.writeText(address)
              }}
              title="Click to copy"
            >
              {address.slice(0, 6)}…{address.slice(-4)}
            </div>
            <button
              className="btn-secondary"
              onClick={() => disconnect()}
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              Disconnect
            </button>
          </>
        ) : (
          <LiquidButton
            onClick={handleConnect}
            disabled={isPending}
            className="connect-glass-btn"
            size="lg"
          >
            <Wallet size={16} />
            {isPending ? 'Connecting…' : 'Connect Wallet'}
          </LiquidButton>
        )}
      </header>

      {/* Main content */}
      <div className="main-wrapper">
        <div className="main-content fade-in">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/send" element={<SendPage />} />
            <Route path="/receive" element={<Receive />} />
            <Route path="/paylink" element={<CreatePayLink />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App
