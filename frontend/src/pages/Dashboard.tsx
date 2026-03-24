import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { Link } from 'react-router-dom'
import { Send, QrCode, Link as LinkIcon, Wallet, ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw } from 'lucide-react'

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  direction: 'sent' | 'received'
}

function shortenAddr(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function formatSHM(weiStr: string) {
  const val = Number(weiStr) / 1e18
  if (val === 0) return '0'
  if (val < 0.0001) return '<0.0001'
  return val.toFixed(4)
}

function timeAgo(timestamp: number) {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchTransactions = useCallback(async () => {
    if (!address) return
    setLoading(true)
    setError('')
    
    try {
      // Try Shardeum Explorer API (Blockscout-based)
      const res = await fetch(
        `https://explorer-mezame.shardeum.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&page=1&offset=10`
      )
      const data = await res.json()
      
      if (data.status === '1' && Array.isArray(data.result)) {
        const txs: Transaction[] = data.result.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to || '',
          value: tx.value,
          timestamp: Number(tx.timeStamp),
          direction: tx.from.toLowerCase() === address.toLowerCase() ? 'sent' : 'received',
        }))
        setTransactions(txs)
      } else {
        // If API doesn't return data, show empty state
        setTransactions([])
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      setError('Could not load transactions')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    if (isConnected && address) {
      fetchTransactions()
    }
  }, [isConnected, address, fetchTransactions])

  if (!isConnected) {
    return (
      <div className="flex-center" style={{ marginTop: '4rem' }}>
        <Wallet size={64} color="var(--accent)" style={{ marginBottom: '1rem' }} />
        <h2 className="page-title">Welcome to PayShard</h2>
        <p className="page-subtitle">A next-generation Shardeum wallet for PayFi.</p>
        <div style={{ backgroundColor: 'var(--bg-hover)', padding: '1.5rem', borderRadius: '1rem', marginTop: '2rem' }}>
          Connect your wallet using the button on the top right to get started.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card">
        <div className="balance-title">Available Balance (SHM)</div>
        <div className="balance-amount">
          {balance ? (Number(balance.value) / 1e18).toFixed(4) : '0.0000'}
          <span className="balance-currency">SHM</span>
        </div>
        <div className="address-pill" style={{ marginTop: '1.5rem' }}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
      </div>

      <h3 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>Quick Actions</h3>
      <div className="quick-actions" style={{ marginTop: 0 }}>
        <Link to="/send" className="action-btn">
          <div className="action-icon">
            <Send size={20} />
          </div>
          Send
        </Link>
        <Link to="/receive" className="action-btn">
          <div className="action-icon">
            <QrCode size={20} />
          </div>
          Receive
        </Link>
        <Link to="/paylink" className="action-btn">
          <div className="action-icon">
            <LinkIcon size={20} />
          </div>
          PayLink
        </Link>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Recent Transactions</h3>
          <button
            onClick={fetchTransactions}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.8rem',
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem' }}>{error}</p>
        )}
        
        {!loading && transactions.length === 0 && !error && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
            No recent transactions yet.
          </p>
        )}

        {transactions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {transactions.map((tx) => (
              <a
                key={tx.hash}
                href={`https://explorer-mezame.shardeum.org/tx/${tx.hash}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--bg-hover)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--border)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: tx.direction === 'sent' 
                    ? 'rgba(239, 68, 68, 0.15)' 
                    : 'rgba(0, 209, 102, 0.15)',
                  color: tx.direction === 'sent' ? '#ef4444' : 'var(--accent)',
                  flexShrink: 0,
                }}>
                  {tx.direction === 'sent' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {tx.direction === 'sent' ? 'Sent' : 'Received'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {tx.direction === 'sent' ? `To: ${shortenAddr(tx.to)}` : `From: ${shortenAddr(tx.from)}`}
                    {' · '}
                    {timeAgo(tx.timestamp)}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 700,
                    color: tx.direction === 'sent' ? '#ef4444' : 'var(--accent)',
                  }}>
                    {tx.direction === 'sent' ? '-' : '+'}{formatSHM(tx.value)} SHM
                  </div>
                </div>

                <ExternalLink size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
