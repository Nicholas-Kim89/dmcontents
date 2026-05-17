import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { CreativeStudio } from './components/CreativeStudio'
import { CampaignStudio } from './components/CampaignStudio'
import { AdminPanel } from './components/AdminPanel'
import { AuthPage } from './components/AuthPage'
import { NewProjectModal } from './components/NewProjectModal'
import { AuthProvider, useAuth } from './context/AuthContext'
import AssetLibrary from './components/AssetLibrary'
import TeamSpace from './components/TeamSpace'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, ChevronRight, ArrowRight, Plus, LogOut, User, Building2, ShieldCheck, Library, Users } from 'lucide-react'

interface Project {
  id: string
  name: string
  type: string
  description?: string
  created_at: string
  members?: { id: string; name: string; department: string }[]
}

function AppContent() {
  const { user, token, logout, currentTeam, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [studioIncoming, setStudioIncoming] = useState<{ url?: string | null; prompt?: string | null; text?: string | null } | null>(null)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (user && token && currentTeam) fetchProjects()
  }, [user, token, currentTeam])

  const fetchProjects = async () => {
    try {
      const res = await fetch(`http://localhost:8000/projects?team_id=${currentTeam?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setProjects(data)
    } catch (err) {
      console.error('Failed to fetch projects', err)
    }
  }

  const handleCreateProject = () => setShowNewProject(true)

  const handleProjectCreated = (project: unknown) => {
    const proj = project as Project
    setProjects(prev => [proj, ...prev])
    setCurrentProject(proj)
    setShowNewProject(false)
    setActiveTab('editor')
  }

  const selectProject = (proj: Project) => {
    setCurrentProject(proj)
    setActiveTab('editor')
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <div className="flex h-screen bg-background text-on-surface overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onNewProject={handleCreateProject}
        isAdmin={user.role === 'admin'}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[5%] left-[10%] w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

        <Header
          title={activeTab === 'editor' ? 'Creative Studio' : activeTab === 'admin' ? 'Admin Panel' : 'Synthetix AI'}
          breadcrumbs={[
            { label: 'Project Hub' },
            { label: currentProject ? currentProject.name : 'Overview', active: true }
          ]}
          rightSlot={
            <div className="flex items-center gap-2">
              <button onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/70 hover:text-white transition-all">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/50 to-accent/40 flex items-center justify-center text-[10px] font-bold">
                  {user.name[0]}
                </div>
                <span className="text-xs font-medium">{user.name}</span>
                {user.role === 'admin' && <ShieldCheck size={12} className="text-primary" />}
              </button>
              <button onClick={logout}
                className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-xl text-white/40 hover:text-red-400 transition-all">
                <LogOut size={14} />
              </button>
            </div>
          }
        />

        <main className="flex-1 overflow-hidden flex flex-col relative z-10">
          {/* Dashboard */}
          <div className={`flex-1 flex flex-col ${activeTab === 'dashboard' ? 'block' : 'hidden'}`}>
            <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
              <div className="max-w-6xl mx-auto space-y-12">
                <section className="space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                      안녕하세요, <span className="text-primary">{user.name}</span>님.
                    </h1>
                    <p className="text-on-surface-variant text-lg max-w-2xl mt-3">
                      Synthetix AI Marketing Agent가 준비되어 있습니다.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleCreateProject} className="btn-primary flex items-center gap-2">
                      <Plus size={18} />
                      New Project
                    </button>
                    <button className="glass px-6 py-2 rounded-full font-semibold hover:bg-white/5 transition-all flex items-center gap-2">
                      Explore Library
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </section>

                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Recent Projects</h2>
                    <button className="text-primary flex items-center gap-1 text-sm font-semibold hover:underline">
                      View All <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((proj) => (
                      <ProjectCard
                        key={proj.id}
                        title={proj.name}
                        type={proj.type}
                        date={proj.created_at}
                        description={proj.description}
                        memberCount={proj.members?.length ?? 0}
                        image={`https://images.unsplash.com/photo-${proj.id === 'proj-1' ? '1618005182384-a83a8bd57fbe' : '1620641788421-7a1c342ea42e'}?auto=format&fit=crop&q=80&w=400`}
                        onClick={() => selectProject(proj)}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Creative Studio */}
          <div className={`flex-1 flex flex-col h-full ${activeTab === 'editor' ? 'flex' : 'hidden'}`}>
            <CreativeStudio
              project={currentProject}
              incomingImage={studioIncoming}
              clearIncomingImage={() => setStudioIncoming(null)}
            />
          </div>

          {/* Campaign Studio */}
          <div className={`flex-1 flex flex-col h-full ${activeTab === 'campaign' ? 'flex' : 'hidden'}`}>
            <CampaignStudio
              project={currentProject}
              onMoveToStudio={(url, prompt, text) => {
                setStudioIncoming({ url, prompt, text })
                setActiveTab('editor')
              }}
            />
          </div>

          {/* Asset Library */}
          <div className={`flex-1 flex flex-col h-full ${activeTab === 'library' ? 'flex' : 'hidden'}`}>
            <AssetLibrary />
          </div>

          {/* Team Space */}
          <div className={`flex-1 flex flex-col h-full ${activeTab === 'team' ? 'flex' : 'hidden'}`}>
            <TeamSpace />
          </div>

          {/* Admin Panel */}
          {user.role === 'admin' && (
            <div className={`flex-1 flex flex-col h-full ${activeTab === 'admin' ? 'flex' : 'hidden'}`}>
              <AdminPanel />
            </div>
          )}
        </main>
      </div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProject && (
          <NewProjectModal
            onClose={() => setShowNewProject(false)}
            onCreated={handleProjectCreated}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  )
}

function ProjectCard({
  title, type, date, image, description, memberCount, onClick
}: {
  title: string; type: string; date: string; image: string; description?: string; memberCount?: number; onClick?: () => void
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="glass-card overflow-hidden group cursor-pointer"
    >
      <div className="h-48 overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 rounded-full bg-accent/20 backdrop-blur-md text-accent text-xs font-bold border border-accent/30">{type}</span>
        </div>
      </div>
      <div className="p-5 space-y-2">
        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{title}</h3>
        {description && <p className="text-white/40 text-xs line-clamp-2">{description}</p>}
        <div className="flex items-center justify-between text-on-surface-variant text-sm">
          <span>{date}</span>
          <div className="flex items-center gap-3">
            {(memberCount ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-xs text-white/30">
                <User size={12} />
                {memberCount}
              </span>
            )}
            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
