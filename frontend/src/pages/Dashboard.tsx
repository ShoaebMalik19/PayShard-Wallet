import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { Link } from 'react-router-dom'
import { Send, QrCode, Link2, Wallet, ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw } from 'lucide-react'

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  direction: 'sent' | 'received'
}

function shortenAddr(addr: string) {
  return addr.slice(0, 6) + '…' + addr.slice(-4)
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

  const fetchTransactions = useCallback(async () => {
    if (!address) return
    setLoading(true)
    try {
      const res = await fetch(
        `https://explorer-mezame.shardeum.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&page=1&offset=10`
      )
      const data = await res.json()
      if (data.status === '1' && Array.isArray(data.result)) {
        setTransactions(data.result.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to || '',
          value: tx.value,
          timestamp: Number(tx.timeStamp),
          direction: tx.from.toLowerCase() === address.toLowerCase() ? 'sent' : 'received',
        })))
      } else {
        setTransactions([])
      }
    } catch {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    if (isConnected && address) fetchTransactions()
  }, [isConnected, address, fetchTransactions])

  if (!isConnected) {
    return (
      <div className="empty-state-center">
        <Wallet size={56} color="var(--accent)" style={{ marginBottom: '1.5rem', opacity: 0.7 }} />
        <h2 className="page-title">Welcome to PayShard</h2>
        <p className="page-subtitle" style={{ maxWidth: 400 }}>Connect your wallet to access the next-generation Shardeum PayFi dashboard.</p>
      </div>
    )
  }

  const balanceVal = balance ? (Number(balance.value) / 1e18).toFixed(4) : '0.0000'

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your PayShard overview at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card balance-hero">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value">
            {balanceVal}<span className="unit">SHM</span>
          </div>
          <div className="quick-actions-row">
            <Link to="/send" className="quick-action-btn">
              <Send size={16} /> Send
            </Link>
            <Link to="/receive" className="quick-action-btn">
              <QrCode size={16} /> Receive
            </Link>
            <Link to="/paylink" className="quick-action-btn">
              <Link2 size={16} /> Create PayLink
            </Link>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Network</div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>Shardeum Testnet</div>
          <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chain ID: 8119</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Wallet</div>
          <div className="address-pill" style={{ marginTop: 4 }}>{shortenAddr(address || '')}</div>
          <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <a href={`https://explorer-mezame.shardeum.org/address/${address}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              View on Explorer <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{transactions.length}<span className="unit" style={{ fontSize: '0.85rem' }}>recent</span></div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Transactions</div>
            <div className="card-subtitle">Your latest on-chain activity</div>
          </div>
          <button
            className="btn-secondary"
            onClick={fetchTransactions}
            disabled={loading}
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {!loading && transactions.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No transactions found yet. Send or receive SHM to see activity.
          </p>
        )}

        {transactions.length > 0 && (
          <div className="tx-list">
            {transactions.map((tx) => (
              <a
                key={tx.hash}
                href={`https://explorer-mezame.shardeum.org/tx/${tx.hash}`}
                target="_blank"
                rel="noreferrer"
                className="tx-row"
              >
                <div className={`tx-icon ${tx.direction}`}>
                  {tx.direction === 'sent' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                </div>
                <div>
                  <div className="tx-type">{tx.direction === 'sent' ? 'Sent' : 'Received'}</div>
                  <div className="tx-meta">
                    {tx.direction === 'sent' ? `To ${shortenAddr(tx.to)}` : `From ${shortenAddr(tx.from)}`}
                  </div>
                </div>
                <div className="tx-meta">{timeAgo(tx.timestamp)}</div>
                <div className={`tx-amount ${tx.direction}`}>
                  {tx.direction === 'sent' ? '−' : '+'}{formatSHM(tx.value)} SHM
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
