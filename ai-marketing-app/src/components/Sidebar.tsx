import { 
  LayoutDashboard, 
  PenTool, 
  Library, 
  Users, 
  Settings, 
  HelpCircle,
  Plus,
  Sparkles,
  GitMerge,
  ShieldCheck,
  ChevronDown,
  Building2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { clsx } from 'clsx'

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onNewProject: () => void;
  isAdmin?: boolean;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, onNewProject, isAdmin }: SidebarProps) {
  const { currentTeam, teams, setCurrentTeam, refreshTeams, token } = useAuth()
  const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false)
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim() || !token) return
    try {
      const res = await fetch('http://localhost:8000/teams', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newTeamName })
      })
      if (res.ok) {
        const team = await res.json()
        await refreshTeams()
        setCurrentTeam(team)
        setNewTeamName('')
        setIsCreatingTeam(false)
        setIsTeamMenuOpen(false)
      }
    } catch (err) {
      console.error('Failed to create team', err)
    }
  }

  return (
    <aside className={`glass border-r border-white/5 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex flex-col z-50`}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="text-on-primary w-6 h-6" />
        </div>
        {isOpen && (
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight leading-none">Synthetix</h1>
            <p className="text-[10px] text-on-surface-variant font-medium tracking-widest uppercase mt-1">Enterprise AI</p>
          </div>
        )}
      </div>

      {/* Team Switcher */}
      <div className="px-4 mb-4 relative">
        <button
          onClick={() => isOpen && setIsTeamMenuOpen(!isTeamMenuOpen)}
          className={clsx(
            "w-full flex items-center gap-3 p-3 rounded-xl transition-all border border-white/5",
            isOpen ? "bg-white/5 hover:bg-white/10" : "justify-center bg-transparent border-none"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
            <Building2 size={16} />
          </div>
          {isOpen && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentTeam?.name || 'Select Team'}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-tighter">Workspace</p>
              </div>
              <ChevronDown className={clsx("w-4 h-4 text-white/20 transition-transform", isTeamMenuOpen && "rotate-180")} />
            </>
          )}
        </button>

        <AnimatePresence>
          {isTeamMenuOpen && isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full inset-x-4 mt-2 bg-surface-container/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-[60]"
            >
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 mb-2">
                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => {
                      setCurrentTeam(team)
                      setIsTeamMenuOpen(false)
                    }}
                    className={clsx(
                      "w-full flex items-center gap-3 p-2 rounded-xl text-sm transition-all",
                      currentTeam?.id === team.id ? "bg-primary/20 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold">
                      {team.name[0]}
                    </div>
                    <span className="truncate">{team.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="pt-2 border-t border-white/5">
                {isCreatingTeam ? (
                  <form onSubmit={handleCreateTeam} className="p-2 space-y-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Team name..."
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setIsCreatingTeam(false)}
                        className="flex-1 text-[10px] text-white/40 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-primary text-white text-[10px] py-1.5 rounded-lg font-bold"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setIsCreatingTeam(true)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl text-xs text-primary font-bold hover:bg-primary/10 transition-all"
                  >
                    <Plus size={14} />
                    New Team Space
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 mb-6">
        <button 
          onClick={onNewProject}
          className={`w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary-container hover:bg-primary transition-all duration-300 font-semibold rounded-xl ${isOpen ? 'py-3' : 'p-3'}`}
        >
          <Plus size={20} />
          {isOpen && <span>New Project</span>}
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        <NavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
          isOpen={isOpen} 
        />
        <NavItem 
          icon={<PenTool size={20} />} 
          label="Creative Studio" 
          active={activeTab === 'editor'} 
          onClick={() => setActiveTab('editor')}
          isOpen={isOpen} 
        />
        <NavItem 
          icon={<Library size={20} />} 
          label="Asset Library" 
          active={activeTab === 'library'} 
          onClick={() => setActiveTab('library')}
          isOpen={isOpen} 
        />
        <NavItem 
          icon={<GitMerge size={20} />} 
          label="Campaign Pipeline" 
          active={activeTab === 'campaign'} 
          onClick={() => setActiveTab('campaign')}
          isOpen={isOpen} 
        />
        <NavItem 
          icon={<Users size={20} />} 
          label="Team Space" 
          active={activeTab === 'team'} 
          onClick={() => setActiveTab('team')}
          isOpen={isOpen} 
        />
        {isAdmin && (
          <NavItem 
            icon={<ShieldCheck size={20} />} 
            label="Admin Panel" 
            active={activeTab === 'admin'} 
            onClick={() => setActiveTab('admin')}
            isOpen={isOpen}
            accent
          />
        )}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-1">
        <NavItem 
          icon={<Settings size={20} />} 
          label="Settings" 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
          isOpen={isOpen} 
        />
        <NavItem 
          icon={<HelpCircle size={20} />} 
          label="Help Center" 
          active={activeTab === 'help'} 
          onClick={() => setActiveTab('help')}
          isOpen={isOpen} 
        />
      </div>
    </aside>
  )
}

function NavItem({ icon, label, active, onClick, isOpen, accent }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isOpen: boolean, accent?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
        active 
          ? accent ? 'bg-amber-500/15 text-amber-400 border-r-2 border-amber-400' : 'bg-primary/15 text-primary border-r-2 border-primary' 
          : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
      }`}
    >
      <span className={`${active ? (accent ? 'text-amber-400' : 'text-primary') : 'group-hover:translate-x-1 transition-transform'}`}>{icon}</span>
      {isOpen && <span className="font-semibold text-sm">{label}</span>}
    </button>
  )
}
