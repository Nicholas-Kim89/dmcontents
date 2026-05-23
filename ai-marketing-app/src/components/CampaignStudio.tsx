import { useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Trash2, Sparkles, Loader2, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Copy, Image as ImageIcon,
  Target, PenTool, Shield, RefreshCw, ArrowRight, Download, MessageSquare, Send, Search, X, Globe
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// -----------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------
const IMAGE_MODELS = [
  { id: 'gemini-3.1-flash-image-preview', name: 'Nano Banana 2', type: 'Gemini' },
  { id: 'gemini-3-pro-image-preview', name: 'Nano Banana Pro', type: 'Gemini' },
  { id: 'gemini-2.5-flash-image', name: 'Nano Banana', type: 'Gemini' },
  { id: 'imagen-4.0-ultra-generate-001', name: 'Imagen 4.0 Ultra', type: 'Imagen' },
  { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0 Standard', type: 'Imagen' },
]

const GEMINI_RATIOS = ['1:1', '16:9', '9:16', '21:9', '4:3', '3:4', '2:3', '3:2']
const IMAGEN_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4']
const RESOLUTIONS = ['512', '1K', '2K', '4K']

const STAGE_ORDER: AgentStage[] = ['idle', 'researcher', 'planner', 'creator', 'critic', 'generating_images', 'done']

const AGENT_SUBTASKS = {
  researcher: [
    "브랜드 지식베이스 및 업로드 문서 요약 분석",
    "Google 실시간 웹 리서치 및 경쟁사 마케팅 동향 파악",
    "B2B 타겟 산업군 동향 및 핵심 구매 요인(TCO, ESG) 매핑",
    "시장 분석 데이터 수집 및 에이전트 적재 완료"
  ],
  planner: [
    "B2B 마케팅 기획 프레임워크 및 상세 광고 전략 설계",
    "구매 의사결정권자(C-Level, 구매처, 엔지니어) 페르소나 매핑",
    "시장 데이터 기반 B2B 캠페인 크리에이티브 시나리오 구성",
    "B2B 캠페인 기획서(Strategy Playbook) 최종 설계"
  ],
  creator: [
    "3대 맞춤형 광고 카피 시안(가치/ROI, 친환경 규제, 테크니컬 스펙) 제작",
    "B2B 글로벌 전문성 및 산업 특화 테크니컬 톤앤매너 정밀 교정",
    "비주얼 이미지 생성을 위한 고품질 디렉션 프롬프트 3종 기획",
    "광고 카피 및 시각 디자인 가이드라인 구성 완료"
  ],
  critic: [
    "LG화학 브랜드 가이드라인 준수 및 전문 용어 표기 적합성 검수",
    "B2B 글로벌 규제 준수 및 허위/과장 광고 소지 정밀 오딧",
    "오딧 피드백 기반 실시간 3단 자동 보완 및 브랜드 안전성 심사",
    "브랜드 적합성 최종 검증 및 배포 승인"
  ],
  generating_images: [
    "Imagen 엔진 기반 B2B 시각 디자인 디렉션 분석",
    "맞춤형 B2B 비주얼 시안 1 실시간 렌더링 및 검증",
    "맞춤형 B2B 비주얼 시안 2 실시간 렌더링 및 검증",
    "맞춤형 B2B 비주얼 시안 3 실시간 렌더링 및 검증"
  ]
}

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------
interface UploadedFile { name: string; size: number }
interface CampaignResult {
  strategy: string
  copies: string[]
  image_prompts: string[]
  review_result: string
  retry_count: number
}
interface GeneratedImage { prompt: string; url: string; index: number }

type AgentStage = 'idle' | 'researcher' | 'planner' | 'creator' | 'critic' | 'generating_images' | 'done' | 'error'
type Mode = 'multi-agent' | 'chatbot'
type ChatMessage = { role: 'user' | 'model', content: string, images?: string[] }

interface CampaignStudioProps {
  project: { id: string; name: string } | null;
  onMoveToStudio?: (url?: string | null, prompt?: string | null, text?: string | null) => void;
  campaignChatIncoming?: { images: string[]; prompt: string } | null;
  clearCampaignChatIncoming?: () => void;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------
export function CampaignStudio({ project, onMoveToStudio, campaignChatIncoming, clearCampaignChatIncoming }: CampaignStudioProps) {
  const { token, currentTeam } = useAuth()
  // File state
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [rawFiles, setRawFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sessionId] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    // HTTPS가 아닌 비보안 HTTP 환경에서도 동작하는 표준 UUID v4 생성 Fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  })

  // Brief
  const [prompt, setPrompt] = useState('')

  // B2B & LG Chem custom target settings
  const [targetIndustry, setTargetIndustry] = useState('Chemicals & Advanced Materials')
  const [customIndustry, setCustomIndustry] = useState('')
  const [buyerPersona, setBuyerPersona] = useState('Purchasing & Procurement Manager')
  const [customPersona, setCustomPersona] = useState('')
  const [b2bStrategy, setB2bStrategy] = useState('Lead Generation')
  const [customStrategy, setCustomStrategy] = useState('')

  // Image model settings
  const [selectedModel, setSelectedModel] = useState(IMAGE_MODELS[0])
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [resolution, setResolution] = useState('1K')

  // Pipeline state
  const [stage, setStage] = useState<AgentStage>('idle')
  const [result, setResult] = useState<CampaignResult | null>(null)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>('images')
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null)
  const [subtaskProgress, setSubtaskProgress] = useState<number>(0)
  const [copiesLang, setCopiesLang] = useState<string>('ko')
  const [translatedCopies, setTranslatedCopies] = useState<Record<string, string[]>>({})
  const [isTranslatingCopies, setIsTranslatingCopies] = useState(false)

  // Mode & Chat state
  const [mode, setMode] = useState<Mode>('multi-agent')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [useSearch, setUseSearch] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Chat attachments state
  const [chatAttachedImages, setChatAttachedImages] = useState<string[]>([])

  // -----------------------------------------------------------------------
  // File helpers
  // -----------------------------------------------------------------------
  const ACCEPTED = ['.pdf', '.docx', '.pptx', '.ppt', '.txt']
  const addFiles = (newFiles: File[]) => {
    const valid = newFiles.filter(f => ACCEPTED.some(ext => f.name.toLowerCase().endsWith(ext)))
    setRawFiles(prev => [...prev, ...valid])
    setFiles(prev => [...prev, ...valid.map(f => ({ name: f.name, size: f.size }))])
  }
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }, [])
  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
    setRawFiles(prev => prev.filter((_, idx) => idx !== i))
  }
  const fmtSize = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`
  const fileIcon = (n: string) => n.endsWith('.pdf') ? '📄' : n.endsWith('.docx') ? '📝' : n.endsWith('.pptx') ? '📊' : '📃'

  const availRatios = selectedModel.type === 'Imagen' ? IMAGEN_RATIOS : GEMINI_RATIOS
  const availRes = RESOLUTIONS.filter(r => {
    if (selectedModel.id.includes('imagen-4.0-ultra')) return r !== '4K'
    return true
  })

  // -----------------------------------------------------------------------
  // Pipeline
  // -----------------------------------------------------------------------
  const runPipeline = async () => {
    if (!prompt.trim()) return
    setError(null); setResult(null); setImages([]); setCopiesLang('ko'); setTranslatedCopies({})

    // Upload files
    if (rawFiles.length > 0) {
      setStage('planner')
      const fd = new FormData()
      fd.append('session_id', sessionId)
      if (currentTeam?.id) fd.append('team_id', currentTeam.id)
      rawFiles.forEach(f => fd.append('files', f))
      try {
        await fetch('/campaign/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: fd
        })
      }
      catch { setError('File upload failed.'); setStage('error'); return }
    }

    // Stage transitions for UX & Subtasks
    setSubtaskProgress(0)
    setStage('researcher')

    let currentProgress = 0
    const intervalId = setInterval(() => {
      currentProgress += 1
      if (currentProgress > 15) {
        currentProgress = 15 // Hold at final validation of Brand Critic Agent
      }
      setSubtaskProgress(currentProgress)

      if (currentProgress < 4) {
        setStage('researcher')
      } else if (currentProgress < 8) {
        setStage('planner')
      } else if (currentProgress < 12) {
        setStage('creator')
      } else {
        setStage('critic')
      }
    }, 2200)

    try {
      const fd = new FormData()
      fd.append('session_id', sessionId)
      fd.append('prompt', prompt)
      fd.append('google_search', useSearch.toString())
      fd.append('target_industry', targetIndustry === 'custom' ? customIndustry : targetIndustry)
      fd.append('buyer_persona', buyerPersona === 'custom' ? customPersona : buyerPersona)
      fd.append('b2b_strategy', b2bStrategy === 'custom' ? customStrategy : b2bStrategy)
      if (project?.id) fd.append('project_id', project.id)

      const res = await fetch('/campaign/generate', { method: 'POST', body: fd })
      clearInterval(intervalId) // Clear the ticking timer
      
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Unknown error') }

      const data: CampaignResult = await res.json()
      setSubtaskProgress(16) // Instantly complete all agent subtasks
      setResult(data)

      // Now generate images from the prompts
      setStage('generating_images')
      const generated: GeneratedImage[] = []
      for (let i = 0; i < data.image_prompts.length; i++) {
        try {
          const imgRes = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: selectedModel.id,
              prompt: data.image_prompts[i],
              aspect_ratio: aspectRatio,
              image_size: resolution,
              project_id: project?.id
            })
          })
          if (imgRes.ok) {
            const imgData = await imgRes.json()
            generated.push({ prompt: data.image_prompts[i], url: imgData.image, index: i })
            setImages([...generated]) // update progressively
          }
        } catch { /* continue with remaining */ }
      }

      setStage('done')
      setExpandedSection('images')
    } catch (e: any) {
      clearInterval(intervalId)
      setError(e.message); setStage('error')
    }
  }

  const stripCopyPrefix = (text: string): string => {
    return text.replace(/^\*?\*?variant\s+\d+\s*(?:\([^)]+\))?:\*?\*?\s*|^\*?\*?variant\s+\d+\s*(?:\([^)]+\))?\*?\*?\s*:\s*/i, '')
  }

  const getSubtaskStatus = (s: AgentStage, subIdx: number): 'done' | 'active' | 'pending' => {
    if (stage === 'done') return 'done'
    const currentStageIdx = STAGE_ORDER.indexOf(stage)
    const thisStageIdx = STAGE_ORDER.indexOf(s)
    if (thisStageIdx < currentStageIdx) return 'done'
    if (thisStageIdx > currentStageIdx) return 'pending'
    
    let localProgress = 0
    if (s === 'researcher') localProgress = subtaskProgress
    else if (s === 'planner') localProgress = subtaskProgress - 4
    else if (s === 'creator') localProgress = subtaskProgress - 8
    else if (s === 'critic') localProgress = subtaskProgress - 12
    else if (s === 'generating_images') {
      if (images.length > subIdx) return 'done'
      if (images.length === subIdx) return 'active'
      return 'pending'
    }

    if (localProgress > subIdx) return 'done'
    if (localProgress === subIdx) return 'active'
    return 'pending'
  }

  const handleCopiesLangChange = async (lang: string) => {
    if (lang === 'ko') {
      setCopiesLang('ko')
      return
    }
    
    if (translatedCopies[lang]) {
      setCopiesLang(lang)
      return
    }
    
    if (!result?.copies || result.copies.length === 0) return
    setIsTranslatingCopies(true)
    try {
      const promises = result.copies.map(copy =>
        fetch('/campaign/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: copy, target_lang: lang })
        }).then(async res => {
          if (!res.ok) throw new Error('Translation failed')
          const data = await res.json()
          return data.translated || ''
        })
      )
      const translatedList = await Promise.all(promises)
      setTranslatedCopies(prev => ({ ...prev, [lang]: translatedList }))
      setCopiesLang(lang)
    } catch (e) {
      console.error(e)
      alert('맞춤형 광고 카피 번역에 실패했습니다. 네트워크 상태를 확인해 주세요.')
    } finally {
      setIsTranslatingCopies(false)
    }
  }

  const handleCustomCopiesLang = async () => {
    const customLang = window.prompt("번역을 원하시는 언어를 직접 입력해 주세요. (예: 독일어, 프랑스어, 베트남어, 힌디어 등)")
    if (!customLang || !customLang.trim()) return
    await handleCopiesLangChange(customLang.trim())
  }

  const copyText = (t: string) => navigator.clipboard.writeText(t)
  const downloadImg = (url: string, i: number) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `campaign-image-${i + 1}.png`
    a.click()
  }

  // Load conversation history on project select
  useEffect(() => {
    if (!project?.id) {
      setChatMessages([])
      return
    }
    const fetchHistory = async () => {
      try {
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        
        const res = await fetch(`/campaign/chat/history?project_id=${project.id}`, { headers })
        if (res.ok) {
          const data = await res.json()
          setChatMessages(data)
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        }
      } catch (err) {
        console.error('Failed to load chat history:', err)
      }
    }
    fetchHistory()
  }, [project?.id, token])

  // Bridge Listener: Trigger feedback from CreativeStudio
  useEffect(() => {
    if (campaignChatIncoming) {
      setMode('chatbot')
      setChatAttachedImages(campaignChatIncoming.images)
      setChatInput(campaignChatIncoming.prompt)
      clearCampaignChatIncoming?.()
    }
  }, [campaignChatIncoming, clearCampaignChatIncoming])

  // -----------------------------------------------------------------------
  // Chatbot logic
  // -----------------------------------------------------------------------
  const handleChatSubmit = async (e?: React.FormEvent, overrideMsg?: string, overrideImages?: string[]) => {
    e?.preventDefault()
    const finalMsg = overrideMsg !== undefined ? overrideMsg : chatInput.trim()
    const finalImages = overrideImages !== undefined ? overrideImages : chatAttachedImages
    
    if (!finalMsg && finalImages.length === 0) return
    if (isChatLoading) return

    setChatInput('')
    setChatAttachedImages([])

    const newMsgs: ChatMessage[] = [...chatMessages, { role: 'user', content: finalMsg, images: finalImages }]
    setChatMessages(newMsgs)
    setIsChatLoading(true)

    // Ensure files are uploaded first if not uploaded yet
    if (rawFiles.length > 0 && chatMessages.length === 0) {
      const fd = new FormData()
      fd.append('session_id', sessionId)
      if (currentTeam?.id) fd.append('team_id', currentTeam.id)
      rawFiles.forEach(f => fd.append('files', f))
      try {
        await fetch('/campaign/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: fd
        })
      }
      catch { setChatMessages([...newMsgs, { role: 'model', content: 'Error: Failed to upload knowledge assets.' }]); setIsChatLoading(false); return }
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/campaign/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          message: finalMsg,
          history: chatMessages.map(m => ({ role: m.role, content: m.content })),
          google_search: useSearch,
          project_id: project?.id || null,
          images: finalImages
        })
      })
      if (!res.ok) throw new Error('Chat failed')
      const data = await res.json()
      setChatMessages([...newMsgs, { role: 'model', content: data.response }])
    } catch (e: any) {
      setChatMessages([...newMsgs, { role: 'model', content: `Error: ${e.message}` }])
    } finally {
      setIsChatLoading(false)
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  const isRunning = ['researcher', 'planner', 'creator', 'critic', 'generating_images'].includes(stage)
  const isGenImgs = stage === 'generating_images'

  return (
    <div className="flex-1 flex overflow-hidden bg-surface-container-lowest h-full min-h-0">

      {/* ── Left: Config Panel (설정 패널) ──────────────────────────────────────── */}
      <div className="w-[380px] flex flex-col border-r border-white/5 bg-surface-container shrink-0 overflow-y-auto custom-scrollbar">
        <div className="p-5 border-b border-white/5 space-y-4">
          <div className="flex bg-surface-container-highest p-1 rounded-xl">
            <button
              onClick={() => setMode('multi-agent')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'multi-agent' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-white'}`}
            >
              <Sparkles size={14} /> Multi-Agent 모드
            </button>
            <button
              onClick={() => setMode('chatbot')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'chatbot' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-white'}`}
            >
              <MessageSquare size={14} /> 지식 챗봇 모드
            </button>
          </div>
          {mode === 'multi-agent' && <p className="text-xs text-on-surface-variant mt-0.5">시장 분석 → 캠페인 기획 → 광고 카피 제작 → 이미지 생성</p>}
          {mode === 'chatbot' && <p className="text-xs text-on-surface-variant mt-0.5">업로드된 지식 자산을 기반으로 자유롭게 질문하고 탐색합니다.</p>}
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* 프로젝트 배지 */}
          {project && (
            <div className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-2">
              <Target size={13} /> {project.name}
            </div>
          )}

          {/* ── 브랜드 지식 자산 (Knowledge Assets) ── */}
          <section className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">브랜드 지식 자산 (Knowledge Assets)</label>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all
                ${isDragging ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
            >
              <Upload size={24} className="mx-auto mb-2 text-on-surface-variant" />
              <p className="text-sm font-semibold">마케팅 참고 파일을 여기에 놓으세요</p>
              <p className="text-xs text-on-surface-variant mt-0.5">PDF · DOCX · PPTX · TXT 지원</p>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.pptx,.ppt,.txt" className="hidden"
                onChange={e => addFiles(Array.from(e.target.files || []))} />
            </div>
            <AnimatePresence>
              {files.map((f, i) => (
                <motion.div key={f.name + i} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container-high border border-white/5">
                  <span className="text-lg">{fileIcon(f.name)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{f.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{fmtSize(f.size)}</p>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-error/50 hover:text-error"><Trash2 size={13} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>

          {/* ── Google 실시간 웹 검색 ── */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-white/5">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${useSearch ? 'bg-primary/20 text-primary' : 'bg-white/5 text-on-surface-variant'}`}>
                <Search size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold">Google 실시간 웹 검색</p>
                <p className="text-[8px] text-on-surface-variant">시장 실시간 동향 및 트렌드 반영</p>
              </div>
            </div>
            <button
              onClick={() => setUseSearch(!useSearch)}
              className={`w-10 h-5 rounded-full transition-all relative ${useSearch ? 'bg-primary' : 'bg-white/10'}`}
            >
              <motion.div
                animate={{ x: useSearch ? 22 : 2 }}
                className="w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm"
              />
            </button>
          </div>

          {mode === 'multi-agent' && (
            <>
              {/* ── B2B 타겟 마케팅 설정 ── */}
              <section className="space-y-3 p-4 rounded-2xl bg-surface-container-lowest border border-white/5">
                <div className="flex items-center gap-1.5 text-primary">
                  <Sparkles size={14} />
                  <span className="text-xs font-bold uppercase tracking-wide">B2B 타겟 마케팅 설정</span>
                </div>
                
                {/* 대상 산업군 (Target Industry) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">대상 산업군 (Target Industry)</label>
                  <select 
                    value={targetIndustry}
                    onChange={e => setTargetIndustry(e.target.value)}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                  >
                    <option value="Chemicals & Advanced Materials">Chemicals & Advanced Materials (LG Chem Core)</option>
                    <option value="EV Battery & Energy Solutions">EV Battery & Energy Solutions</option>
                    <option value="IT / SaaS / Cloud">IT / SaaS / Cloud</option>
                    <option value="Bio & Healthcare / Pharma">Bio & Healthcare / Pharma</option>
                    <option value="Manufacturing & Heavy Industrial">Manufacturing & Heavy Industrial</option>
                    <option value="Semiconductors & Electronics">Semiconductors & Electronics</option>
                    <option value="custom">직접 입력...</option>
                  </select>
                  {targetIndustry === 'custom' && (
                    <input 
                      type="text" 
                      value={customIndustry} 
                      onChange={e => setCustomIndustry(e.target.value)} 
                      placeholder="대상 산업군을 직접 입력해 주세요" 
                      className="w-full mt-1.5 bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                    />
                  )}
                </div>

                {/* 구매자 페르소나 (Buyer Persona) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">구매자 페르소나 / 직책 (Buyer Persona)</label>
                  <select 
                    value={buyerPersona}
                    onChange={e => setBuyerPersona(e.target.value)}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                  >
                    <option value="Purchasing & Procurement Manager">Purchasing & Procurement Manager (TCO/ROI 지향)</option>
                    <option value="Sustainability & Compliance Auditor">Sustainability & Compliance Auditor (ECO/친환경 스펙 지향)</option>
                    <option value="Technical R&D / Product Engineer">Technical R&D / Product Engineer (물성/데이터 지향)</option>
                    <option value="C-Level Decision Maker (CEO/CTO/CMO)">C-Level Decision Maker (전략/경영 지향)</option>
                    <option value="Operations & Commercial Excellence Manager">Operations & Commercial Excellence Manager</option>
                    <option value="custom">직접 입력...</option>
                  </select>
                  {buyerPersona === 'custom' && (
                    <input 
                      type="text" 
                      value={customPersona} 
                      onChange={e => setCustomPersona(e.target.value)} 
                      placeholder="구매자 페르소나를 직접 입력해 주세요" 
                      className="w-full mt-1.5 bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                    />
                  )}
                </div>

                {/* 마케팅 전략 목표 (B2B Strategy Focus) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">마케팅 전략 목표 (B2B Strategy)</label>
                  <select 
                    value={b2bStrategy}
                    onChange={e => setB2bStrategy(e.target.value)}
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                  >
                    <option value="Lead Generation">Lead Generation (리드 확보)</option>
                    <option value="Thought Leadership">Thought Leadership (전문성/시장 트렌드 전파)</option>
                    <option value="Product Demo / Technical Consultation">Product Demo & 기술 상담 신청 유치</option>
                    <option value="Brand Awareness & Partner Trust">Brand Awareness & 파트너 신뢰 구축</option>
                    <option value="custom">직접 입력...</option>
                  </select>
                  {b2bStrategy === 'custom' && (
                    <input 
                      type="text" 
                      value={customStrategy} 
                      onChange={e => setCustomStrategy(e.target.value)} 
                      placeholder="전략 목표를 직접 입력해 주세요" 
                      className="w-full mt-1.5 bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                    />
                  )}
                </div>
              </section>

              {/* ── 캠페인 상세 브리프 (Campaign Brief) ── */}
              <section className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">캠페인 상세 브리프 (Campaign Brief)</label>
                </div>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
                  className="w-full rounded-2xl bg-surface-container-lowest border border-white/10 text-sm text-on-surface px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/40"
                  placeholder="마케팅할 제품이나 서비스의 구체적인 명칭과 핵심 장점, 주요 마케팅 채널(예: LinkedIn, 뉴스레터, 학회 브로셔 등)을 작성해 주세요. 업로드된 내부 문서(Knowledge Assets)와 B2B 타겟팅 설정에 연동되어 최적의 성과가 생성됩니다." />
                
                {/* 브리프 가이드 팁 */}
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 space-y-1.5">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    💡 효과적인 기획을 위한 작성 가이드
                  </p>
                  <ul className="text-[9px] text-on-surface-variant list-disc pl-3.5 space-y-1 leading-relaxed">
                    <li><strong>제품/소재 강점:</strong> 구체적인 데이터(예: 내열온도, 강도, 재활용 비율 등)를 기재해 주세요.</li>
                    <li><strong>경쟁사 대비 차별점:</strong> 독자 기술력이나 품질 인증 사항을 추가해 주시면 좋습니다.</li>
                    <li><strong>마케팅 채널:</strong> 학회 리플렛용인지, 링크드인 카드뉴스용인지 채널을 지정하면 에이전트가 그에 맞춰 문구를 최적화합니다.</li>
                  </ul>
                </div>
              </section>

              {/* ── 시각 콘텐츠 생성 엔진 (Image Engine) ── */}
              <section className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">시각 콘텐츠 생성 엔진 (Image Engine)</label>
                <select value={selectedModel.id}
                  onChange={e => {
                    const m = IMAGE_MODELS.find(m => m.id === e.target.value)!
                    setSelectedModel(m)
                    if (m.type === 'Imagen' && !IMAGEN_RATIOS.includes(aspectRatio)) setAspectRatio('1:1')
                  }}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface">
                  {IMAGE_MODELS.map(m => (
                    <option key={m.id} value={m.id} className="text-on-surface">{m.name} ({m.type})</option>
                  ))}
                </select>
              </section>

              {/* ── 이미지 해상도 ── */}
              <section className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">해상도 (Resolution)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {RESOLUTIONS.map(r => (
                    <button key={r} onClick={() => setResolution(r)} disabled={!availRes.includes(r)}
                      className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${resolution === r ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container-lowest border-white/5 text-on-surface-variant disabled:opacity-20 hover:border-white/20'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </section>

              {/* ── 이미지 종횡비 ── */}
              <section className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">종횡비 (Aspect Ratio)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {availRatios.map(r => (
                    <button key={r} onClick={() => setAspectRatio(r)}
                      className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${aspectRatio === r ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container-lowest border-white/5 text-on-surface-variant hover:border-white/20'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </section>


              {/* ── 파이프라인 가동 ── */}
              <button onClick={runPipeline} disabled={isRunning || !prompt.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-on-primary font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer">
                {isRunning ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
                {isRunning ? '마케팅 파이프라인 가동 중...' : 'AI 마케팅 파이프라인 시작하기'}
              </button>

              {error && (
                <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-3 text-error text-xs flex items-start gap-2">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />{error}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Right: Results or Chat (결과 창 및 챗봇) ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">

        {mode === 'multi-agent' ? (
          <>
            {/* Stage bar (진행 단계 표시바) */}
            <div className="h-16 border-b border-white/5 flex items-center px-6 gap-3 shrink-0 bg-surface-container/50 backdrop-blur-md overflow-x-auto">
              <AgentStep icon={<Search size={14} />} label="시장 조사 에이전트" active={stage === 'researcher'} done={['planner', 'creator', 'critic', 'generating_images', 'done'].includes(stage)} />
              <ArrowRight size={14} className="text-white/20 shrink-0" />
              <AgentStep icon={<Target size={14} />} label="B2B 전략 기획 에이전트" active={stage === 'planner'} done={['creator', 'critic', 'generating_images', 'done'].includes(stage)} />
              <ArrowRight size={14} className="text-white/20 shrink-0" />
              <AgentStep icon={<PenTool size={14} />} label="카피 제작 에이전트" active={stage === 'creator'} done={['critic', 'generating_images', 'done'].includes(stage)} />
              <ArrowRight size={14} className="text-white/20 shrink-0" />
              <AgentStep icon={<Shield size={14} />} label="브랜드 안전성 검증 에이전트" active={stage === 'critic'} done={['generating_images', 'done'].includes(stage)} />
              <ArrowRight size={14} className="text-white/20 shrink-0" />
              <AgentStep icon={<ImageIcon size={14} />} label="시각 디자인 에이전트" active={stage === 'generating_images'} done={stage === 'done'} />
              {result && result.retry_count > 0 && (
                <div className="ml-auto flex items-center gap-1.5 text-xs text-accent font-semibold shrink-0">
                  <RefreshCw size={12} /> {result.retry_count}회 자동 보완 검토 완료
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">

              {/* Idle (대기 상태) */}
              {stage === 'idle' && (
                <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Sparkles size={30} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">캠페인을 시작할 준비가 되었습니다</h3>
                  <p className="text-sm text-on-surface-variant max-w-sm">좌측 패널에서 마케팅 대상(B2B)과 상세 정보를 설정한 뒤 파이프라인 가동 버튼을 클릭해 보세요.</p>
                </div>
              )}

              {/* Running (가동 중) */}
              {isRunning && (
                <div className="space-y-3">
                  {[
                    { s: 'researcher', msg: '시장 동향 및 B2B 고객사 실시간 리서치 중...' },
                    { s: 'planner', msg: '리서치 데이터 분석 및 B2B 기획서 설계 중...' },
                    { s: 'creator', msg: '페르소나 관점별 맞춤 광고 카피 및 이미지 컨셉 구성 중...' },
                    { s: 'critic', msg: '브랜드 가이드라인 및 B2B 규제 준수 여부 정밀 검증 중...' },
                    { s: 'generating_images', msg: `${selectedModel.name} 엔진으로 고품질 시각 콘텐츠 이미지 생성 중 (${aspectRatio} · ${resolution})...` },
                  ].map(({ s, msg }, i) => {
                    const isActive = stage === s
                    const currentStageIdx = STAGE_ORDER.indexOf(stage)
                    const thisStageIdx = STAGE_ORDER.indexOf(s as AgentStage)
                    const isDone = thisStageIdx < currentStageIdx

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`rounded-2xl border px-5 py-4 flex flex-col items-stretch transition-all duration-500 ${
                          isActive ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' : isDone ? 'bg-success/5 border-success/20 opacity-80' : 'bg-surface-container-high border-white/5 opacity-30'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-4">
                          {isActive ? (
                            <Loader2 size={16} className="animate-spin text-primary shrink-0" />
                          ) : isDone ? (
                            <CheckCircle size={16} className="text-success shrink-0" />
                          ) : (
                            <div className="w-4 h-4 shrink-0" />
                          )}
                          <span className={`text-sm font-semibold transition-colors ${
                            isActive ? 'text-primary' : isDone ? 'text-on-surface' : 'text-on-surface-variant'
                          }`}>{msg}</span>
                          {/* Show progressive image count when generating */}
                          {isActive && isGenImgs && images.length > 0 && (
                            <span className="ml-auto text-[10px] font-bold text-accent">{images.length}/{result?.image_prompts.length}장 생성 완료</span>
                          )}
                        </div>

                        {/* Detailed Subtasks */}
                        {(isActive || isDone) && s !== 'idle' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-3 pl-8 pt-3 border-t border-white/5 space-y-2.5 overflow-hidden"
                          >
                            {(AGENT_SUBTASKS[s as keyof typeof AGENT_SUBTASKS] || []).map((subtask, subIdx) => {
                              const status = getSubtaskStatus(s as AgentStage, subIdx)
                              const displaySubtask = subtask.replace("Imagen 엔진", selectedModel.name)
                              return (
                                <div key={subIdx} className="flex items-center gap-2.5">
                                  {status === 'done' && <CheckCircle size={12} className="text-success shrink-0" />}
                                  {status === 'active' && <Loader2 size={12} className="animate-spin text-primary shrink-0" />}
                                  {status === 'pending' && <div className="w-3 h-3 rounded-full border border-white/20 shrink-0" />}
                                  <span className={`text-[11px] transition-colors duration-300 ${
                                    status === 'done' ? 'text-on-surface/50 line-through decoration-white/10' :
                                    status === 'active' ? 'text-primary font-bold' :
                                    'text-on-surface-variant/40'
                                  }`}>
                                    {displaySubtask}
                                  </span>
                                </div>
                              )
                            })}
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}

                  {/* Progressive image preview while generating */}
                  {isGenImgs && images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      {images.map((img, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                          className="rounded-2xl overflow-hidden border border-white/10 aspect-video bg-surface-container-high">
                          <img src={img.url} alt={`Generated ${i}`} className="w-full h-full object-cover" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Error (실패 상태) */}
              {stage === 'error' && (
                <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center">
                    <AlertCircle size={30} className="text-error" />
                  </div>
                  <h3 className="text-xl font-bold text-error">파이프라인 실행 중 오류 발생</h3>
                  <p className="text-sm text-on-surface-variant max-w-xs">{error || '캠페인 생성 도중 예기치 못한 에러가 발생했습니다.'}</p>
                  <button onClick={() => setStage('idle')} className="text-xs font-bold text-primary hover:underline">처음으로 돌아가기</button>
                </div>
              )}
              {stage === 'done' && result && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Review badge */}
                  <div className={`rounded-2xl border px-5 py-3 flex items-center gap-3 text-sm font-bold
                ${result.review_result.startsWith('APPROVE') ? 'bg-success/10 border-success/30 text-success' : 'bg-warning/10 border-warning/30 text-warning'}`}>
                    {result.review_result.startsWith('APPROVE') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {result.review_result.startsWith('APPROVE') ? '브랜드 안전성 검증 및 규제 적합성 승인 완료' : '브랜드 오딧 보완 피드백 자동 반영 완료'}
                    <span className="ml-auto text-[10px] font-normal text-on-surface-variant">{selectedModel.name} · {aspectRatio} · {resolution}</span>
                  </div>

                  {/* ── Generated Images ── */}
                  <ResultSection id="images" icon={<ImageIcon size={15} />} title={`생성된 시각 디자인 결과물 (${images.length}장)`}
                    expanded={expandedSection === 'images'} onToggle={() => setExpandedSection(expandedSection === 'images' ? null : 'images')}>
                    {images.length === 0
                      ? <p className="text-xs text-on-surface-variant italic">생성된 이미지가 없습니다.</p>
                      : (
                        <div className="space-y-4">
                          {images.map((img, i) => (
                            <div key={i} className="rounded-2xl overflow-hidden border border-white/10 bg-surface-container-lowest">
                              <img
                                src={img.url}
                                alt={`Campaign ${i + 1}`}
                                className="w-full object-cover max-h-64 cursor-zoom-in hover:opacity-95 transition-opacity"
                                onClick={() => setActivePreviewImage(img.url)}
                                title="클릭하여 원래 크기로 보기"
                              />
                              <div className="px-4 py-3 flex items-start gap-3">
                                <span className="text-[10px] font-black text-accent shrink-0 bg-accent/10 px-1.5 py-0.5 rounded-md mt-0.5">시안 {i + 1}</span>
                                <p className="text-[11px] text-on-surface-variant flex-1 leading-relaxed font-mono">{img.prompt}</p>
                                <div className="flex gap-1.5 shrink-0">
                                  <button onClick={() => copyText(img.prompt)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors" title="프롬프트 복사"><Copy size={13} /></button>
                                  <button onClick={() => downloadImg(img.url, i)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-accent transition-colors" title="다운로드"><Download size={13} /></button>
                                  {onMoveToStudio && (
                                    <button
                                      onClick={() => onMoveToStudio(img.url, img.prompt)}
                                      className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                                      title="스튜디오에서 디자인 편집"
                                    >
                                      <PenTool size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    }
                  </ResultSection>

                  {/* ── Strategy ── */}
                  <ResultSection id="strategy" icon={<Target size={15} />} title="B2B 캠페인 기획서 (Strategy Playbook)"
                    expanded={expandedSection === 'strategy'} onToggle={() => setExpandedSection(expandedSection === 'strategy' ? null : 'strategy')}>
                    <div className="text-xs text-on-surface-variant leading-relaxed markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {result.strategy}
                      </ReactMarkdown>
                    </div>
                  </ResultSection>

                  {/* ── Copies ── */}
                  <ResultSection id="copies" icon={<PenTool size={15} />} title="맞춤형 광고 카피 시안 (3대 핵심 관점)"
                    expanded={expandedSection === 'copies'} onToggle={() => setExpandedSection(expandedSection === 'copies' ? null : 'copies')}>
                    
                    {/* 번역 컨트롤 패널 */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4 bg-surface-container-lowest p-1 rounded-xl w-fit border border-white/5 shadow-sm">
                      {[
                        { code: 'ko', label: '한국어 (기본)' },
                        { code: 'en', label: 'English (영어)' },
                        { code: 'zh', label: '中文 (중국어)' },
                        { code: 'ja', label: '日本語 (일본어)' },
                        { code: 'es', label: 'Español (스페인어)' }
                      ].map(lang => (
                        <button
                          key={lang.code}
                          disabled={isTranslatingCopies}
                          onClick={() => handleCopiesLangChange(lang.code)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${copiesLang === lang.code ? 'bg-primary text-on-primary shadow-sm scale-105' : 'text-on-surface-variant hover:text-white'}`}
                        >
                          {lang.label}
                        </button>
                      ))}
                      
                      {/* 직접 입력 버튼 */}
                      <button
                        disabled={isTranslatingCopies}
                        onClick={handleCustomCopiesLang}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${!['ko', 'en', 'zh', 'ja', 'es'].includes(copiesLang) ? 'bg-accent text-on-accent shadow-sm scale-105' : 'bg-white/5 text-on-surface-variant hover:text-white'}`}
                      >
                        <Globe size={10} />
                        {!['ko', 'en', 'zh', 'ja', 'es'].includes(copiesLang) ? `${copiesLang} 번역됨` : '직접 입력...'}
                      </button>

                      {isTranslatingCopies && (
                        <span className="text-[9px] font-semibold text-primary animate-pulse flex items-center gap-1 ml-2 pr-2">
                          <Loader2 size={10} className="animate-spin" /> 카피 실시간 번역 중...
                        </span>
                      )}
                    </div>

                    {/* 카피 카드 목록 */}
                    <div className={`space-y-3 transition-all duration-300 ${isTranslatingCopies ? 'opacity-50 blur-[2px] pointer-events-none' : ''}`}>
                      {result.copies.map((copy, i) => {
                        const activeCopyText = copiesLang === 'ko' ? copy : (translatedCopies[copiesLang]?.[i] || '');
                        return (
                          <div key={i} className="rounded-xl bg-surface-container-lowest border border-white/5 px-4 py-3 flex items-start gap-3 relative overflow-hidden">
                            <span className="text-[10px] font-black text-primary shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-md mt-0.5">V{i + 1}</span>
                            <div className="text-sm text-on-surface flex-1 leading-relaxed markdown-body">
                              {activeCopyText ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {activeCopyText}
                                </ReactMarkdown>
                              ) : (
                                <div className="space-y-2 py-2 animate-pulse">
                                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                  <div className="h-3 bg-white/5 rounded w-5/6"></div>
                                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0 font-mono mt-0.5">
                              <button
                                onClick={() => copyText(stripCopyPrefix(activeCopyText || ''))}
                                disabled={!activeCopyText}
                                className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg disabled:opacity-50"
                                title="카피 텍스트 복사"
                              >
                                <Copy size={12} className="text-primary" />
                                <span className="text-[10px] font-bold">텍스트 복사</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ResultSection>

                  {/* ── Image Prompts (text only) ── */}
                  <ResultSection id="image_prompts" icon={<ImageIcon size={15} />} title="시각 프롬프트 원문 (Raw Prompts)"
                    expanded={expandedSection === 'image_prompts'} onToggle={() => setExpandedSection(expandedSection === 'image_prompts' ? null : 'image_prompts')}>
                    <div className="space-y-3">
                      {result.image_prompts.map((p, i) => (
                        <div key={i} className="rounded-xl bg-surface-container-lowest border border-white/5 px-4 py-3 flex items-start gap-3">
                          <span className="text-[10px] font-black text-accent shrink-0 bg-accent/10 px-1.5 py-0.5 rounded-md mt-0.5">P{i + 1}</span>
                          <p className="text-xs text-on-surface-variant flex-1 font-mono leading-relaxed">{p}</p>
                          <button onClick={() => copyText(p)} className="text-on-surface-variant hover:text-accent shrink-0"><Copy size={13} /></button>
                        </div>
                      ))}
                    </div>
                  </ResultSection>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          /* ── Chatbot UI (챗봇 UI) ── */
          <div className="flex-1 flex flex-col bg-surface-container-lowest overflow-hidden" style={{minHeight: 0}}>
            <div className="h-16 border-b border-white/5 flex items-center px-6 shrink-0 bg-surface-container/50 backdrop-blur-md">
              <MessageSquare size={18} className="text-primary mr-2" />
              <h2 className="text-lg font-bold">브랜드 지식 마케팅 챗봇</h2>
            </div>

            <div className="chat-scroll-area p-6 space-y-6 custom-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-on-surface-variant opacity-50">
                  <MessageSquare size={48} className="mb-4" />
                  <p>업로드하신 사내 문서 및 브랜드 지식 자산에 관해 마케팅 활용 방안이나 핵심 스펙을 1:1로 자유롭게 질문해 보세요.</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface-container-high text-on-surface border border-white/5 rounded-tl-sm'}`}>
                      {msg.images && msg.images.length > 0 && (
                        <div className={`grid ${msg.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-2 max-w-sm`}>
                          {msg.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Attached ${idx}`}
                              className="rounded-lg max-h-40 w-full object-cover border border-white/10 shadow-sm cursor-zoom-in hover:opacity-90 transition-opacity"
                              onClick={() => {
                                if (onMoveToStudio) {
                                  onMoveToStudio(img, 'AI 디자인 피드백');
                                }
                              }}
                              title="Click to load in Creative Studio"
                              style={{ cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                      )}
                      {msg.role === 'user' ? (
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                      ) : (
                        <div className="text-sm leading-relaxed markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-high border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 shadow-lg flex items-center gap-2 text-on-surface-variant">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">전문 마케터 에이전트 분석 중...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-white/5 bg-surface-container/30">
              <form onSubmit={(e) => handleChatSubmit(e)} className="relative max-w-4xl mx-auto bg-surface-container-highest border border-white/10 rounded-2xl p-2 transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 shadow-inner">
                {chatAttachedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 border-b border-white/5 mb-2">
                    {chatAttachedImages.map((img, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10 group shadow-md">
                        <img src={img} className="w-full h-full object-cover" alt="Attachment" />
                        <button
                          type="button"
                          onClick={() => setChatAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-error hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative flex items-center w-full">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="지식 챗봇에게 메시지를 전송하세요..."
                    className="w-full bg-transparent border-none pl-3 pr-12 py-2 text-sm focus:outline-none focus:ring-0 text-on-surface"
                  />
                  <button
                    type="submit"
                    disabled={(!chatInput.trim() && chatAttachedImages.length === 0) || isChatLoading}
                    className="absolute right-2 p-2 bg-primary rounded-full text-on-primary hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ── Image Preview Modal ── */}
      <AnimatePresence>
        {activePreviewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[95vw] max-h-[92vh] rounded-3xl overflow-y-auto border border-white/10 bg-surface-container-lowest shadow-2xl p-8 flex flex-col items-center custom-scrollbar"
            >
              {/* Close Button */}
              <button
                onClick={() => setActivePreviewImage(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all border border-white/10 cursor-pointer shadow-md"
                title="닫기"
              >
                <X size={18} />
              </button>
              
              <img
                src={activePreviewImage}
                alt="Campaign Preview"
                className="max-w-full object-contain rounded-xl select-none shadow-2xl mt-4 border border-white/5"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// -----------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------
function AgentStep({ icon, label, active, done }: { icon: React.ReactNode, label: string, active: boolean, done: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold shrink-0 transition-all
      ${active ? 'bg-primary/10 border-primary/40 text-primary' : done ? 'bg-success/10 border-success/30 text-success' : 'bg-surface-container-high border-white/5 text-on-surface-variant'}`}>
      {active ? <Loader2 size={13} className="animate-spin" /> : done ? <CheckCircle size={13} /> : icon}
      {label}
    </div>
  )
}

function ResultSection({ id, icon, title, expanded, onToggle, children }: {
  id: string, icon: React.ReactNode, title: string, expanded: boolean, onToggle: () => void, children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-surface-container-high border border-white/5 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2.5 text-sm font-bold"><span className="text-primary">{icon}</span>{title}</div>
        {expanded ? <ChevronUp size={15} className="text-on-surface-variant" /> : <ChevronDown size={15} className="text-on-surface-variant" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function delay(ms: number) { return new Promise(res => setTimeout(res, ms)) }
