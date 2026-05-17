import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { CheckCircle, XCircle, Clock, Loader2, Users, RefreshCw } from 'lucide-react'

interface PendingUser {
  id: string
  name: string
  email: string
  department: string
  created_at: string
}

export function AdminPanel() {
  const { token } = useAuth()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const fetchPending = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/admin/pending-users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setPendingUsers(data)
    } catch {
      setPendingUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchPending() }, [])

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    setProcessingId(userId)
    setMessage(null)
    try {
      const res = await fetch(`/admin/${action}/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
      setMessage({ type: 'success', text: data.message })
      setPendingUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.' })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">관리자 패널</h1>
            <p className="text-white/40 mt-1">신규 가입 신청을 검토하고 승인 또는 거절 처리합니다</p>
          </div>
          <button onClick={fetchPending}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white text-sm font-semibold transition-all">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>

        {/* Alert message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`px-5 py-4 rounded-2xl text-sm font-medium border ${message.type === 'success'
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Card */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-surface-container/50 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock size={22} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white/40 text-sm">승인 대기 중</p>
              <p className="text-3xl font-bold text-white">{pendingUsers.length}</p>
            </div>
          </div>
        </div>

        {/* Pending List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-white">승인 대기 목록</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="text-primary animate-spin" />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-20 bg-surface-container/30 border border-white/5 rounded-3xl">
              <CheckCircle size={40} className="text-green-500/40 mx-auto mb-3" />
              <p className="text-white/30 font-medium">처리할 가입 신청이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map(user => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-surface-container/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center gap-4"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center shrink-0 border border-white/10">
                    <span className="text-lg font-bold text-white">{user.name[0]}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{user.name}</span>
                      <span className="text-xs font-mono text-white/30">@{user.id}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">대기 중</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>📧 {user.email}</span>
                      <span>🏢 {user.department}</span>
                      <span>📅 {user.created_at}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(user.id, 'approve')}
                      disabled={processingId === user.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/40 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {processingId === user.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      승인
                    </button>
                    <button
                      onClick={() => handleAction(user.id, 'reject')}
                      disabled={processingId === user.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      거절
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
