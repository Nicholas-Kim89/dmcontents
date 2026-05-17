import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, Image as ImageIcon, Upload, Search, FileText,
  Plus, MoreVertical, Trash2, Download, ExternalLink,
  ChevronRight, Sparkles, Filter, File
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { clsx } from 'clsx'

interface Asset {
  id: string
  team_id: string
  type: string
  name: string
  file_url: string
  created_at: string
  created_by: string
}

export default function AssetLibrary() {
  const { token, currentTeam } = useAuth()
  const [activeTab, setActiveTab] = useState<'media' | 'documents' | 'brand'>('media')
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (currentTeam && token) {
      fetchAssets()
    }
  }, [currentTeam, token])

  const fetchAssets = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`http://localhost:8000/assets?team_id=${currentTeam?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAssets(data)
      }
    } catch (err) {
      console.error('Failed to fetch assets', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentTeam || !token) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('team_id', currentTeam.id)
    formData.append('asset_type', 'image')
    formData.append('file', file)

    try {
      const res = await fetch('http://localhost:8000/assets/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (res.ok) {
        fetchAssets()
      }
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setIsUploading(false)
    }
  }

  const mediaAssets = assets.filter(a => 
    a.type !== 'document' && a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const documentAssets = assets.filter(a => 
    a.type === 'document' && a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const fileExtIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return '📄'
    if (ext === 'docx' || ext === 'doc') return '📝'
    if (ext === 'pptx' || ext === 'ppt') return '📊'
    if (ext === 'txt') return '📃'
    return '📁'
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-surface overflow-hidden">
      {/* Header */}
      <header className="p-8 pb-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              Asset Library
            </h1>
            <p className="text-white/50 text-sm">
              {currentTeam?.name}의 브랜드 자산과 미디어 리소스를 관리합니다.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="에셋 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-surface-container/50 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            
            <label className="flex items-center gap-2 bg-primary hover:bg-primary-container text-white px-5 py-3 rounded-2xl font-medium transition-all cursor-pointer shadow-lg shadow-primary/20 active:scale-95">
              <Upload className="w-4 h-4" />
              업로드
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={isUploading}
                accept="image/*,.pdf,.docx,.doc,.pptx,.ppt,.txt"
              />
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/5">
          {[
            { id: 'media', label: 'Media Gallery', icon: ImageIcon, count: mediaAssets.length },
            { id: 'documents', label: 'Documents', icon: FileText, count: documentAssets.length },
            { id: 'brand', label: 'Brand Identity', icon: Palette, count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "pb-4 flex items-center gap-2 text-sm font-medium transition-all relative",
                activeTab === tab.id ? "text-primary" : "text-white/40 hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="ml-1 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">{tab.count}</span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'media' ? (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-surface-container/50 rounded-3xl animate-pulse border border-white/5" />
                ))
              ) : mediaAssets.length > 0 ? (
                mediaAssets.map(asset => (
                  <motion.div
                    key={asset.id}
                    layout
                    whileHover={{ y: -4 }}
                    className="group relative bg-surface-container/30 border border-white/5 rounded-3xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-black/20">
                      <img 
                        src={`http://localhost:8000${asset.file_url}`} 
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <p className="text-white font-medium text-sm truncate mb-1">{asset.name}</p>
                      <div className="flex items-center justify-between text-[10px] text-white/60">
                        <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          <a
                            href={`http://localhost:8000${asset.file_url}`}
                            download={asset.name}
                            className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/5 rounded-3xl bg-surface-container/10">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p>등록된 미디어 에셋이 없습니다.</p>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'documents' ? (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-surface-container/50 rounded-2xl animate-pulse border border-white/5" />
                ))
              ) : documentAssets.length > 0 ? (
                <div className="bg-surface-container/30 border border-white/5 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5">
                        <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">파일명</th>
                        <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">업로드 일시</th>
                        <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">업로더</th>
                        <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider text-right">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {documentAssets.map(asset => (
                        <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{fileExtIcon(asset.name)}</span>
                              <div>
                                <p className="text-sm font-medium text-white">{asset.name}</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-wider">{asset.name.split('.').pop()} 문서</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/50">{new Date(asset.created_at).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-white/50">{asset.created_by}</td>
                          <td className="px-6 py-4 text-right">
                            <a
                              href={`http://localhost:8000${asset.file_url}`}
                              download={asset.name}
                              className="inline-flex items-center gap-1.5 text-white/30 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/5 rounded-3xl bg-surface-container/10">
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  <p className="mb-2">등록된 문서 에셋이 없습니다.</p>
                  <p className="text-xs text-white/20">Campaign Pipeline에서 PDF, DOCX 파일을 업로드하면 여기에 자동으로 저장됩니다.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="brand"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 max-w-5xl"
            >
              {/* Brand Kit Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colors */}
                <section className="bg-surface-container/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      Color Palette
                    </h3>
                    <button className="text-primary text-sm hover:underline">수정</button>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                      <div key={color} className="space-y-2">
                        <div 
                          className="aspect-square rounded-2xl shadow-inner border border-white/10" 
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-[10px] text-center text-white/40 font-mono uppercase">{color}</p>
                      </div>
                    ))}
                    <button className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 hover:text-primary hover:border-primary/30 transition-all">
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </section>

                {/* Typography */}
                <section className="bg-surface-container/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Typography
                    </h3>
                    <button className="text-primary text-sm hover:underline">수정</button>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-xs text-white/40 mb-1">Headline Font</p>
                      <p className="text-xl text-white font-bold">Inter Tight</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-xs text-white/40 mb-1">Body Font</p>
                      <p className="text-base text-white">Pretendard Variable</p>
                    </div>
                  </div>
                </section>

                {/* Brand Voice */}
                <section className="col-span-full bg-surface-container/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
                   <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Brand Voice (Tone & Manner)
                    </h3>
                    <button className="text-primary text-sm hover:underline">업데이트</button>
                  </div>
                  <div className="prose prose-invert max-w-none text-white/60 text-sm leading-relaxed">
                    LG화학의 AI 마케팅 에이전트로서, 전문적이면서도 혁신적인 톤을 유지합니다. 
                    신뢰감을 주는 차분한 어조를 바탕으로 하되, 미래지향적인 기술력을 강조하는 단어를 선택합니다.
                    사용자에게는 친절하고 명확한 가이드를 제공하며, 브랜드의 프리미엄 가치를 전달합니다.
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
