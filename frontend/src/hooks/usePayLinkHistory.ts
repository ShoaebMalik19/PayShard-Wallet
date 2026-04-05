import { useState, useEffect, useCallback } from 'react'

export interface PayLinkRecord {
  id: string
  code: string
  passkey: string
  amount: string
  link: string
  txHash: string
  createdAt: number
  status: 'pending' | 'confirmed' | 'claimed'
}

const STORAGE_KEY = 'payshard_paylink_history'

function loadHistory(): PayLinkRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(records: PayLinkRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function usePayLinkHistory() {
  const [history, setHistory] = useState<PayLinkRecord[]>(() => loadHistory())

  // Sync to localStorage whenever history changes
  useEffect(() => {
    saveHistory(history)
  }, [history])

  const addRecord = useCallback((record: Omit<PayLinkRecord, 'id' | 'createdAt'>) => {
    const newRecord: PayLinkRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }
    setHistory((prev) => [newRecord, ...prev])
    return newRecord
  }, [])

  const updateStatus = useCallback((code: string, status: PayLinkRecord['status'], txHash?: string) => {
    setHistory((prev) =>
      prev.map((r) =>
        r.code === code
          ? { ...r, status, ...(txHash ? { txHash } : {}) }
          : r
      )
    )
  }, [])

  const deleteRecord = useCallback((id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return { history, addRecord, updateStatus, deleteRecord, clearHistory }
}
