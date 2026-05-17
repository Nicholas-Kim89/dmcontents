import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building2, AtSign, ArrowRight, ChevronLeft } from 'lucide-react'

type View = 'login' | 'register' | 'forgot'

export function AuthPage() {
  const { login } = useAuth()
  const [view, setView] = useState<View>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Login fields
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regId, setRegId] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regDepartment, setRegDepartment] = useState('')

  // Forgot fields
  const [forgotId, setForgotId] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    try {
      await login(loginId, loginPassword)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.'
      if (msg === 'PENDING') {
        setMessage({ type: 'error', text: '⏳ 관리자 승인 대기 중입니다. 승인 후 로그인 가능합니다.' })
      } else if (msg === 'REJECTED') {
        setMessage({ type: 'error', text: '❌ 계정 가입이 거절되었습니다. 관리자에게 문의하세요.' })
      } else {
        setMessage({ type: 'error', text: msg })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: regId, name: regName, password: regPassword, department: regDepartment })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
      setMessage({ type: 'success', text: '✅ ' + data.message })
      setRegName(''); setRegId(''); setRegPassword(''); setRegDepartment('')
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: forgotId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
      setMessage({ type: 'success', text: '✅ ' + data.message })
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/70 focus:ring-1 focus:ring-primary/40 transition-all"

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff06_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">Synthetix</span>
          </div>
          <p className="text-white/40 text-sm">LG Chem AI Marketing Agent</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {/* ── LOGIN ── */}
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-2xl font-bold text-white mb-1">로그인</h2>
                <p className="text-white/40 text-sm mb-6">LG Chem 계정으로 로그인하세요</p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text" value={loginId} onChange={e => setLoginId(e.target.value)}
                      placeholder="아이디" required
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type={showPassword ? 'text' : 'password'} value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="비밀번호" required
                      className={`${inputClass} pl-10 pr-12`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {message && (
                    <div className={`text-xs px-4 py-3 rounded-xl ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                      {message.text}
                    </div>
                  )}

                  <button type="submit" disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} />로그인</>}
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-between text-xs text-white/40">
                  <button onClick={() => { setView('register'); setMessage(null) }}
                    className="hover:text-primary transition-colors font-medium">
                    회원가입
                  </button>
                  <button onClick={() => { setView('forgot'); setMessage(null) }}
                    className="hover:text-primary transition-colors font-medium">
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── REGISTER ── */}
            {view === 'register' && (
              <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => { setView('login'); setMessage(null) }}
                  className="flex items-center gap-1 text-white/40 hover:text-white text-xs mb-4 transition-colors">
                  <ChevronLeft size={14} /> 로그인으로
                </button>
                <h2 className="text-2xl font-bold text-white mb-1">회원가입</h2>
                <p className="text-white/40 text-sm mb-6">관리자 승인 후 로그인이 가능합니다</p>
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" value={regName} onChange={e => setRegName(e.target.value)}
                      placeholder="이름" required className={`${inputClass} pl-10`} />
                  </div>
                  <div className="relative">
                    <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" value={regId} onChange={e => setRegId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="아이디 (영문 소문자, 숫자만)" required className={`${inputClass} pl-10`} />
                    {regId && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-primary/70">
                        {regId}@lgchem.com
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" value={regDepartment} onChange={e => setRegDepartment(e.target.value)}
                      placeholder="소속 (예: DM팀, R&D팀)" required className={`${inputClass} pl-10`} />
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type={showPassword ? 'text' : 'password'} value={regPassword}
                      onChange={e => setRegPassword(e.target.value)} placeholder="비밀번호" required
                      className={`${inputClass} pl-10 pr-12`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {message && (
                    <div className={`text-xs px-4 py-3 rounded-xl ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                      {message.text}
                    </div>
                  )}

                  <button type="submit" disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-2">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} />가입 신청</>}
                  </button>
                </form>
                <p className="text-center text-[10px] text-white/25 mt-4">
                  아이디는 <Mail size={10} className="inline" /> {regId || 'ID'}@lgchem.com으로 이메일이 자동 생성됩니다
                </p>
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {view === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => { setView('login'); setMessage(null) }}
                  className="flex items-center gap-1 text-white/40 hover:text-white text-xs mb-4 transition-colors">
                  <ChevronLeft size={14} /> 로그인으로
                </button>
                <h2 className="text-2xl font-bold text-white mb-1">비밀번호 찾기</h2>
                <p className="text-white/40 text-sm mb-6">아이디를 입력하면 임시 비밀번호를 이메일로 발송합니다</p>
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="relative">
                    <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" value={forgotId} onChange={e => setForgotId(e.target.value)}
                      placeholder="아이디" required className={`${inputClass} pl-10`} />
                  </div>

                  {message && (
                    <div className={`text-xs px-4 py-3 rounded-xl ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                      {message.text}
                    </div>
                  )}

                  <button type="submit" disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><Mail size={16} />임시 비밀번호 발송</>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
