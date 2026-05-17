import { useState, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Trash2, Sparkles, Loader2, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Copy, Image as ImageIcon,
  Target, PenTool, Shield, RefreshCw, ArrowRight, Download, MessageSquare, Send, Search
} from 'lucide-react'

// -----------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------
const IMAGE_MODELS = [
  { id: 'gemini-3.1-flash-image-preview', name: 'Nano Banana 2', type: 'Gemini' },
  { id: 'gemini-3-pro-image-preview',     name: 'Nano Banana Pro', type: 'Gemini' },
  { id: 'gemini-2.5-flash-image',         name: 'Nano Banana', type: 'Gemini' },
  { id: 'imagen-4.0-ultra-generate-001',  name: 'Imagen 4.0 Ultra', type: 'Imagen' },
  { id: 'imagen-4.0-generate-001',        name: 'Imagen 4.0 Standard', type: 'Imagen' },
]

const GEMINI_RATIOS  = ['1:1', '16:9', '9:16', '21:9', '4:3', '3:4', '2:3', '3:2']
const IMAGEN_RATIOS  = ['1:1', '16:9', '9:16', '4:3', '3:4']
const RESOLUTIONS    = ['512', '1K', '2K', '4K']

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

type AgentStage = 'idle' | 'planner' | 'creator' | 'critic' | 'generating_images' | 'done' | 'error'
type Mode = 'multi-agent' | 'chatbot'
type ChatMessage = { role: 'user' | 'model', content: string }

interface CampaignStudioProps {
  project: { id: string; name: string } | null;
  onMoveToStudio?: (url?: string | null, prompt?: string | null, text?: string | null) => void;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------
export function CampaignStudio({ project, onMoveToStudio }: CampaignStudioProps) {
  const { token, currentTeam } = useAuth()
  // File state
  const [files, setFiles]       = useState<UploadedFile[]>([])
  const [rawFiles, setRawFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sessionId]  = useState(() => crypto.randomUUID())

  // Brief
  const [prompt, setPrompt] = useState('')

  // Image model settings
  const [selectedModel, setSelectedModel] = useState(IMAGE_MODELS[0])
  const [aspectRatio, setAspectRatio]     = useState('16:9')
  const [resolution, setResolution]       = useState('1K')

  // Pipeline state
  const [stage, setStage]         = useState<AgentStage>('idle')
  const [result, setResult]       = useState<CampaignResult | null>(null)
  const [images, setImages]       = useState<GeneratedImage[]>([])
  const [error, setError]         = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>('images')

  // Mode & Chat state
  const [mode, setMode]                   = useState<Mode>('multi-agent')
  const [chatMessages, setChatMessages]   = useState<ChatMessage[]>([])
  const [chatInput, setChatInput]         = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [useSearch, setUseSearch]         = useState(false)
  const chatEndRef                        = useRef<HTMLDivElement>(null)

  // -----------------------------------------------------------------------
  // File helpers
  // -----------------------------------------------------------------------
  const ACCEPTED = ['.pdf', '.docx', '.pptx', '.ppt', '.txt']
  const addFiles = (newFiles: File[]) => {
    const valid = newFiles.filter(f => ACCEPTED.some(ext => f.name.toLowerCase().endsWith(ext)))
    setRawFiles(prev => [...prev, ...valid])
    setFiles(prev    => [...prev, ...valid.map(f => ({ name: f.name, size: f.size }))])
  }
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }, [])
  const removeFile = (i: number) => {
    setFiles(prev    => prev.filter((_, idx) => idx !== i))
    setRawFiles(prev => prev.filter((_, idx) => idx !== i))
  }
  const fmtSize  = (b: number) => b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${Math.round(b/1024)} KB`
  const fileIcon = (n: string) => n.endsWith('.pdf') ? '📄' : n.endsWith('.docx') ? '📝' : n.endsWith('.pptx') ? '📊' : '📃'

  const availRatios = selectedModel.type === 'Imagen' ? IMAGEN_RATIOS : GEMINI_RATIOS
  const availRes    = RESOLUTIONS.filter(r => {
    if (selectedModel.id.includes('imagen-4.0-ultra')) return r !== '4K'
    return true
  })

  // -----------------------------------------------------------------------
  // Pipeline
  // -----------------------------------------------------------------------
  const runPipeline = async () => {
    if (!prompt.trim()) return
    setError(null); setResult(null); setImages([])

    // Upload files
    if (rawFiles.length > 0) {
      setStage('planner')
      const fd = new FormData()
      fd.append('session_id', sessionId)
      if (currentTeam?.id) fd.append('team_id', currentTeam.id)
      rawFiles.forEach(f => fd.append('files', f))
      try {
        await fetch('http://localhost:8000/campaign/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: fd
        })
      }
      catch { setError('File upload failed.'); setStage('error'); return }
    }

    // Stage transitions for UX
    setStage('planner');  await delay(1200)
    setStage('creator');  await delay(800)
    setStage('critic')

    try {
      const fd = new FormData()
      fd.append('session_id', sessionId)
      fd.append('prompt', prompt)
      fd.append('google_search', useSearch.toString())
      if (project?.id) fd.append('project_id', project.id)

      const res = await fetch('http://localhost:8000/campaign/generate', { method: 'POST', body: fd })
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Unknown error') }

      const data: CampaignResult = await res.json()
      setResult(data)

      // Now generate images from the prompts
      setStage('generating_images')
      const generated: GeneratedImage[] = []
      for (let i = 0; i < data.image_prompts.length; i++) {
        try {
          const imgRes = await fetch('http://localhost:8000/generate', {
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
      setError(e.message); setStage('error')
    }
  }

  const copyText    = (t: string) => navigator.clipboard.writeText(t)
  const downloadImg = (url: string, i: number) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `campaign-image-${i + 1}.png`
    a.click()
  }

  // -----------------------------------------------------------------------
  // Chatbot logic
  // -----------------------------------------------------------------------
  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!chatInput.trim() || isChatLoading) return
    const userMsg = chatInput.trim()
    setChatInput('')
    const newMsgs: ChatMessage[] = [...chatMessages, { role: 'user', content: userMsg }]
    setChatMessages(newMsgs)
    setIsChatLoading(true)

    // Ensure files are uploaded first if not uploaded yet
    if (rawFiles.length > 0 && chatMessages.length === 0) {
      const fd = new FormData()
      fd.append('session_id', sessionId)
      if (currentTeam?.id) fd.append('team_id', currentTeam.id)
      rawFiles.forEach(f => fd.append('files', f))
      try {
        await fetch('http://localhost:8000/campaign/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: fd
        })
      }
      catch { setChatMessages([...newMsgs, { role: 'model', content: 'Error: Failed to upload knowledge assets.' }]); setIsChatLoading(false); return }
    }

    try {
      const res = await fetch('http://localhost:8000/campaign/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMsg,
          history: chatMessages,
          google_search: useSearch
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

  const isRunning     = ['planner','creator','critic','generating_images'].includes(stage)
  const isGenImgs     = stage === 'generating_images'

  return (
    <div className="flex-1 flex overflow-hidden bg-surface-container-lowest">

      {/* ── Left: Config Panel ──────────────────────────────────────── */}
      <div className="w-[380px] flex flex-col border-r border-white/5 bg-surface-container shrink-0 overflow-y-auto custom-scrollbar">
        <div className="p-5 border-b border-white/5 space-y-4">
          <div className="flex bg-surface-container-highest p-1 rounded-xl">
            <button
              onClick={() => setMode('multi-agent')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'multi-agent' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-white'}`}
            >
              <Sparkles size={14} /> Multi-Agent
            </button>
            <button
              onClick={() => setMode('chatbot')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${mode === 'chatbot' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-white'}`}
            >
              <MessageSquare size={14} /> Chatbot
            </button>
          </div>
          {mode === 'multi-agent' && <p className="text-xs text-on-surface-variant mt-0.5">Planner → Creator → Critic → Image</p>}
          {mode === 'chatbot' && <p className="text-xs text-on-surface-variant mt-0.5">Multi-turn chat with uploaded assets.</p>}
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Project badge */}
          {project && (
            <div className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-2">
              <Target size={13} /> {project.name}
            </div>
          )}

          {/* ── Knowledge Assets ── */}
          <section className="space-y-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Knowledge Assets</label>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all
                ${isDragging ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
            >
              <Upload size={24} className="mx-auto mb-2 text-on-surface-variant" />
              <p className="text-sm font-semibold">Drop files here</p>
              <p className="text-xs text-on-surface-variant mt-0.5">PDF · DOCX · PPTX · TXT</p>
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

          {/* ── Google Search Toggle ── */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-white/5">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${useSearch ? 'bg-primary/20 text-primary' : 'bg-white/5 text-on-surface-variant'}`}>
                <Search size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold">Google Search</p>
                <p className="text-[8px] text-on-surface-variant">Real-time market trends</p>
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
              {/* ── Campaign Brief ── */}
              <section className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Campaign Brief</label>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5}
                  className="w-full rounded-2xl bg-surface-container-lowest border border-white/10 text-sm text-on-surface px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant/40"
                  placeholder="Product, goal, target audience, key message..." />
              </section>

              {/* ── Image Model ── */}
              <section className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Image Engine</label>
                <select value={selectedModel.id}
                  onChange={e => {
                    const m = IMAGE_MODELS.find(m => m.id === e.target.value)!
                    setSelectedModel(m)
                    if (m.type === 'Imagen' && !IMAGEN_RATIOS.includes(aspectRatio)) setAspectRatio('1:1')
                  }}
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {IMAGE_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                  ))}
                </select>
              </section>

              {/* ── Resolution ── */}
              <section className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Resolution</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {RESOLUTIONS.map(r => (
                    <button key={r} onClick={() => setResolution(r)} disabled={!availRes.includes(r)}
                      className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${resolution === r ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container-lowest border-white/5 text-on-surface-variant disabled:opacity-20 hover:border-white/20'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </section>

              {/* ── Aspect Ratio ── */}
              <section className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {availRatios.map(r => (
                    <button key={r} onClick={() => setAspectRatio(r)}
                      className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${aspectRatio === r ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container-lowest border-white/5 text-on-surface-variant hover:border-white/20'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </section>


              {/* ── Run ── */}
              <button onClick={runPipeline} disabled={isRunning || !prompt.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-on-primary font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none">
                {isRunning ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
                {isRunning ? 'Pipeline Running...' : 'Launch Campaign Pipeline'}
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

      {/* ── Right: Results or Chat ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {mode === 'multi-agent' ? (
          <>
            {/* Stage bar */}
            <div className="h-16 border-b border-white/5 flex items-center px-6 gap-4 shrink-0 bg-surface-container/50 backdrop-blur-md">
          <AgentStep icon={<Target size={14} />}   label="Planner"          active={stage === 'planner'} done={['creator','critic','generating_images','done'].includes(stage)} />
          <ArrowRight size={14} className="text-white/20 shrink-0" />
          <AgentStep icon={<PenTool size={14} />}  label="Creator"          active={stage === 'creator'} done={['critic','generating_images','done'].includes(stage)} />
          <ArrowRight size={14} className="text-white/20 shrink-0" />
          <AgentStep icon={<Shield size={14} />}   label="Critic"           active={stage === 'critic'} done={['generating_images','done'].includes(stage)} />
          <ArrowRight size={14} className="text-white/20 shrink-0" />
          <AgentStep icon={<ImageIcon size={14} />} label="Image Gen"       active={stage === 'generating_images'} done={stage === 'done'} />
          {result && result.retry_count > 0 && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-accent font-semibold">
              <RefreshCw size={12} /> {result.retry_count} revision{result.retry_count > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">

          {/* Idle */}
          {stage === 'idle' && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles size={30} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold">Ready to Launch</h3>
              <p className="text-sm text-on-surface-variant max-w-xs">Configure your pipeline on the left, then hit Launch.</p>
            </div>
          )}

          {/* Running */}
          {isRunning && (
            <div className="space-y-3">
              {[
                { s: 'planner',          msg: 'Analyzing knowledge assets & building strategy...' },
                { s: 'creator',          msg: 'Crafting ad copy and image prompts...' },
                { s: 'critic',           msg: 'Reviewing against brand guidelines...' },
                { s: 'generating_images',msg: `Generating images with ${selectedModel.name} (${aspectRatio} · ${resolution})...` },
              ].map(({ s, msg }, i) => {
                const isActive = stage === s
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className={`rounded-2xl border px-5 py-4 flex items-center gap-4 ${isActive ? 'bg-primary/10 border-primary/30' : 'bg-surface-container-high border-white/5 opacity-40'}`}>
                    {isActive ? <Loader2 size={16} className="animate-spin text-primary shrink-0" /> : <div className="w-4" />}
                    <span className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>{msg}</span>
                    {/* Show progressive image count when generating */}
                    {isActive && isGenImgs && images.length > 0 && (
                      <span className="ml-auto text-[10px] font-bold text-accent">{images.length}/{result?.image_prompts.length} done</span>
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

          {/* Error */}
          {stage === 'error' && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center">
                <AlertCircle size={30} className="text-error" />
              </div>
              <h3 className="text-xl font-bold text-error">Pipeline Failed</h3>
              <p className="text-sm text-on-surface-variant max-w-xs">{error || 'An unexpected error occurred during the campaign generation.'}</p>
              <button onClick={() => setStage('idle')} className="text-xs font-bold text-primary hover:underline">Return to start</button>
            </div>
          )}
          {stage === 'done' && result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Review badge */}
              <div className={`rounded-2xl border px-5 py-3 flex items-center gap-3 text-sm font-bold
                ${result.review_result.startsWith('APPROVE') ? 'bg-success/10 border-success/30 text-success' : 'bg-warning/10 border-warning/30 text-warning'}`}>
                {result.review_result.startsWith('APPROVE') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {result.review_result.startsWith('APPROVE') ? 'Approved by Critic' : 'Revised by Critic'}
                <span className="ml-auto text-[10px] font-normal text-on-surface-variant">{selectedModel.name} · {aspectRatio} · {resolution}</span>
              </div>

              {/* ── Generated Images ── */}
              <ResultSection id="images" icon={<ImageIcon size={15} />} title={`Generated Images (${images.length})`}
                expanded={expandedSection === 'images'} onToggle={() => setExpandedSection(expandedSection === 'images' ? null : 'images')}>
                {images.length === 0
                  ? <p className="text-xs text-on-surface-variant italic">No images were generated.</p>
                  : (
                    <div className="space-y-4">
                      {images.map((img, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden border border-white/10 bg-surface-container-lowest">
                          <img src={img.url} alt={`Campaign ${i + 1}`} className="w-full object-cover max-h-64" />
                          <div className="px-4 py-3 flex items-start gap-3">
                            <span className="text-[10px] font-black text-accent shrink-0 bg-accent/10 px-1.5 py-0.5 rounded-md mt-0.5">P{i + 1}</span>
                            <p className="text-[11px] text-on-surface-variant flex-1 leading-relaxed font-mono">{img.prompt}</p>
                            <div className="flex gap-1.5 shrink-0">
                              <button onClick={() => copyText(img.prompt)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors" title="Copy prompt"><Copy size={13} /></button>
                              <button onClick={() => downloadImg(img.url, i)} className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-accent transition-colors" title="Download"><Download size={13} /></button>
                              {onMoveToStudio && (
                                <button 
                                  onClick={() => onMoveToStudio(img.url, img.prompt)} 
                                  className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1" 
                                  title="Edit in Studio"
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
              <ResultSection id="strategy" icon={<Target size={15} />} title="Campaign Strategy"
                expanded={expandedSection === 'strategy'} onToggle={() => setExpandedSection(expandedSection === 'strategy' ? null : 'strategy')}>
                <pre className="text-xs text-on-surface-variant whitespace-pre-wrap font-sans leading-relaxed">{result.strategy}</pre>
              </ResultSection>

              {/* ── Copies ── */}
              <ResultSection id="copies" icon={<PenTool size={15} />} title="Ad Copy Variants"
                expanded={expandedSection === 'copies'} onToggle={() => setExpandedSection(expandedSection === 'copies' ? null : 'copies')}>
                <div className="space-y-3">
                  {result.copies.map((copy, i) => (
                    <div key={i} className="rounded-xl bg-surface-container-lowest border border-white/5 px-4 py-3 flex items-start gap-3">
                      <span className="text-[10px] font-black text-primary shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-md mt-0.5">V{i + 1}</span>
                      <p className="text-sm text-on-surface flex-1 leading-relaxed">{copy}</p>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => copyText(copy)} className="text-on-surface-variant hover:text-primary transition-colors" title="Copy text"><Copy size={13} /></button>
                        {onMoveToStudio && (
                          <button 
                            onClick={() => {
                              // If there's at least one generated image, use the first one as background
                              const firstImg = images.length > 0 ? images[0].url : null;
                              const firstPrompt = images.length > 0 ? images[0].prompt : null;
                              onMoveToStudio(firstImg, firstPrompt, copy);
                            }} 
                            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg"
                            title="Create Design with this text"
                          >
                            <Sparkles size={12} className="text-primary" />
                            <span className="text-[10px] font-bold">Design</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ResultSection>

              {/* ── Image Prompts (text only) ── */}
              <ResultSection id="image_prompts" icon={<ImageIcon size={15} />} title="Image Prompts (Raw)"
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
          /* ── Chatbot UI ── */
          <div className="flex-1 flex flex-col bg-surface-container-lowest">
            <div className="h-16 border-b border-white/5 flex items-center px-6 shrink-0 bg-surface-container/50 backdrop-blur-md">
              <MessageSquare size={18} className="text-primary mr-2" />
              <h2 className="text-lg font-bold">Knowledge Chatbot</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-on-surface-variant opacity-50">
                  <MessageSquare size={48} className="mb-4" />
                  <p>Ask anything about your uploaded knowledge assets.</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg ${msg.role === 'user' ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface-container-high text-on-surface border border-white/5 rounded-tl-sm'}`}>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-high border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 shadow-lg flex items-center gap-2 text-on-surface-variant">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-white/5 bg-surface-container/30">
              <form onSubmit={handleChatSubmit} className="relative max-w-4xl mx-auto">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-surface-container-highest border border-white/10 rounded-full pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-full text-on-primary hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
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
