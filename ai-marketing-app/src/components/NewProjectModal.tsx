import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { X, Plus, Search, FolderPlus, Loader2, User } from 'lucide-react'

interface Member {
  id: string
  name: string
  department: string
  email: string
}

interface NewProjectModalProps {
  onClose: () => void
  onCreated: (project: unknown) => void
}

export function NewProjectModal({ onClose, onCreated }: NewProjectModalProps) {
  const { token, currentTeam } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('New Campaign')
  const [customType, setCustomType] = useState('')
  const predefinedTypes = [
    'New Campaign',
    'Marketing Strategy',
    'AI Tuning',
    'Content Creation',
    'Social Media Campaign',
    'Brand Identity',
    'Product Launch',
    'Customer Analysis',
    'Email Marketing',
    'Event Promotion',
    'SEO Optimization',
    'Custom Input'
  ]
  const [memberQuery, setMemberQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const searchRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced member search
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current)
    if (!memberQuery.trim()) { setSearchResults([]); return }

    setIsSearching(true)
    searchRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/users/search?q=${encodeURIComponent(memberQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        // Filter out already selected members
        setSearchResults(data.filter((u: Member) => !selectedMembers.find(m => m.id === u.id)))
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [memberQuery, token, selectedMembers])

  const addMember = (member: Member) => {
    setSelectedMembers(prev => [...prev, member])
    setMemberQuery('')
    setSearchResults([])
  }

  const removeMember = (id: string) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsCreating(true)
    setError('')
    try {
      const res = await fetch('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          type: type === 'Custom Input' ? customType.trim() : type,
          members: selectedMembers.map(m => m.id),
          team_id: currentTeam?.id
        })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail)
      }
      const project = await res.json()
      onCreated(project)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '프로젝트 생성에 실패했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-surface-container/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-visible"
        >
          {/* Gradient accent top */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-80 rounded-t-3xl" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <FolderPlus size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">새 프로젝트</h2>
                <p className="text-xs text-white/40">캠페인 또는 마케팅 프로젝트를 생성합니다</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            {/* Project Name */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">
                프로젝트 이름 <span className="text-primary">*</span>
              </label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="예: Q4 캠페인 스프린트" required
                className={inputClass}
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">
                프로젝트 설명
              </label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="프로젝트 목표, 범위, 주요 내용을 간략히 설명해 주세요..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Project Type */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">
                프로젝트 유형 <span className="text-primary">*</span>
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className={inputClass}
              >
                {predefinedTypes.map(t => (
                  <option key={t} value={t} className="bg-surface-container-highest text-white">
                    {t === 'Custom Input' ? '직접 입력...' : t}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Project Type Input */}
            {type === 'Custom Input' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  placeholder="유형을 직접 입력해 주세요 (예: 글로벌 프로모션)"
                  required
                  className={inputClass}
                />
              </motion.div>
            )}

            {/* Member Search */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">
                팀원 추가
              </label>

              {/* Selected Members Tags */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedMembers.map(m => (
                    <div key={m.id}
                      className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full pl-3 pr-2 py-1">
                      <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center">
                        <User size={11} className="text-primary" />
                      </div>
                      <span className="text-xs text-white font-medium">{m.name}</span>
                      <span className="text-[10px] text-white/40">{m.department}</span>
                      <button type="button" onClick={() => removeMember(m.id)}
                        className="w-4 h-4 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center text-white/40 hover:text-red-400 transition-all">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Input */}
              <div className="relative" ref={dropdownRef}>
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text" value={memberQuery} onChange={e => setMemberQuery(e.target.value)}
                  placeholder="이름으로 팀원 검색..."
                  className={`${inputClass} pl-10`}
                />
                {isSearching && (
                  <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 animate-spin" />
                )}

                {/* Dropdown */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-surface-container-highest border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[240px] z-50 custom-scrollbar"
                    >
                      {searchResults.map((u, i) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => addMember(u)}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${i < searchResults.length - 1 ? 'border-b border-white/5' : ''}`}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-white">{u.name[0]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{u.name}</span>
                              <span className="text-[10px] text-white/30 font-mono">@{u.id}</span>
                            </div>
                            <span className="text-xs text-white/40">{u.department}</span>
                          </div>
                          <Plus size={14} className="text-primary shrink-0" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm font-semibold transition-all">
                취소
              </button>
              <button type="submit" disabled={isCreating || !name.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                {isCreating ? <Loader2 size={16} className="animate-spin" /> : <><FolderPlus size={16} />생성하기</>}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
