import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, LayoutGrid, Settings, Plus, 
  Search, MoreHorizontal, UserPlus, Shield, 
  Clock, ArrowRight, Star, Globe, Lock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { clsx } from 'clsx'

interface Project {
  id: string
  name: string
  description: string
  type: string
  created_at: string
  created_by: string
  team_id: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  department: string
}

export default function TeamSpace() {
  const { token, currentTeam, user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [activeTab, setActiveTab] = useState<'projects' | 'members' | 'settings'>('projects')
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (currentTeam && token) {
      fetchTeamData()
    }
  }, [currentTeam, token])

  const fetchTeamData = async () => {
    setIsLoading(true)
    try {
      const [projRes, memberRes] = await Promise.all([
        fetch(`/projects?team_id=${currentTeam?.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/teams/${currentTeam?.id}/members`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (projRes.ok) setProjects(await projRes.json())
      if (memberRes.ok) setMembers(await memberRes.json())
    } catch (err) {
      console.error('Failed to fetch team data', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchUsers = async (q: string) => {
    setSearchQuery(q)
    if (!q) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(`/users/search?q=${encodeURIComponent(q)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleInviteUser = async (userId: string) => {
    try {
      const res = await fetch(`/teams/${currentTeam?.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId, role: 'EDITOR' })
      })
      if (res.ok) {
        setShowInviteModal(false)
        setSearchQuery('')
        setSearchResults([])
        fetchTeamData() // Refresh members list
      } else {
        const errData = await res.json()
        alert(errData.detail || '초대에 실패했습니다.')
      }
    } catch (err) {
      console.error(err)
      alert('초대 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-surface overflow-hidden">
      {/* Team Profile Banner */}
      <div className="relative h-48 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 shrink-0 overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="absolute bottom-0 inset-x-0 p-8 flex items-end justify-between">
          <div className="flex items-end gap-6">
            <div className="w-24 h-24 rounded-3xl bg-surface-container border border-white/10 shadow-2xl flex items-center justify-center text-primary relative z-10">
              <Users className="w-12 h-12" />
            </div>
            <div className="mb-2 relative z-10">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">{currentTeam?.name}</h1>
                <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-md flex items-center gap-1 uppercase tracking-wider">
                  <Globe className="w-3 h-3" /> Team Space
                </span>
              </div>
              <p className="text-white/60 text-sm">{currentTeam?.description || '팀 설명이 없습니다.'}</p>
            </div>
          </div>

          <div className="flex gap-3 relative z-10">
             <button 
               onClick={() => setActiveTab('settings')}
               className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-medium transition-all border border-white/10"
             >
              <Settings className="w-4 h-4" />
              설정
            </button>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              팀원 초대
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 mt-6 shrink-0">
        <div className="flex gap-8 border-b border-white/5">
          {[
            { id: 'projects', label: 'Projects', icon: LayoutGrid, count: projects.length },
            { id: 'members', label: 'Members', icon: Users, count: members.length },
            { id: 'settings', label: 'Manage Team', icon: Shield, count: null }
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
              {tab.count !== null && (
                <span className="ml-1 text-[10px] bg-white/5 px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTeamTab"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'projects' ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {projects.length > 0 ? (
                projects.map(project => (
                  <motion.div
                    key={project.id}
                    whileHover={{ y: -4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    className="p-6 bg-surface-container/30 border border-white/5 rounded-3xl group cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <LayoutGrid className="w-6 h-6" />
                      </div>
                      <button className="text-white/20 hover:text-white transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                    <p className="text-white/50 text-sm line-clamp-2 mb-6 h-10">{project.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                        <Clock className="w-3 h-3" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
                  <LayoutGrid className="w-12 h-12 mb-4 opacity-10" />
                  <p>이 팀에는 아직 생성된 프로젝트가 없습니다.</p>
                  <button className="mt-4 text-primary hover:underline text-sm font-medium">첫 프로젝트 만들기</button>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'members' ? (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-surface-container/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl"
            >
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map(member => (
                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container border border-white/10 flex items-center justify-center text-white font-bold">
                            {member.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{member.name}</p>
                            <p className="text-[10px] text-white/40">{member.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                          member.role === 'OWNER' ? "bg-primary/20 text-primary" : "bg-white/10 text-white/60"
                        )}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">{member.department}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-white/20 hover:text-white transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <div className="max-w-2xl space-y-8">
               <section className="p-8 bg-surface-container/30 border border-white/5 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">General Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Team Name</label>
                    <input 
                      type="text" 
                      defaultValue={currentTeam?.name} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Description</label>
                    <textarea 
                      rows={3}
                      defaultValue={currentTeam?.description}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <button className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-container transition-all">
                    변경사항 저장
                  </button>
                </div>
              </section>

              <section className="p-8 bg-error/5 border border-error/20 rounded-3xl">
                <h3 className="text-xl font-bold text-error mb-2">Danger Zone</h3>
                <p className="text-white/40 text-sm mb-6">팀을 삭제하면 모든 프로젝트와 에셋이 영구적으로 제거됩니다.</p>
                <button className="bg-error/10 hover:bg-error text-error hover:text-white px-6 py-3 rounded-xl font-medium transition-all border border-error/30">
                  팀 영구 삭제
                </button>
              </section>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container border border-white/10 rounded-3xl w-full max-w-lg overflow-visible relative z-10 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-8 pb-6 flex items-center justify-between border-b border-white/5">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">팀원 초대</h2>
                  <p className="text-white/60 text-sm">팀에 새로운 구성원을 초대하세요.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <UserPlus className="w-6 h-6" />
                </div>
              </div>

              <div className="p-8 flex-1 overflow-visible">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    placeholder="이름으로 팀원 검색..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary transition-colors"
                  />
                  
                  {/* Search Results Dropdown */}
                  {searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/10 rounded-xl overflow-y-auto max-h-60 shadow-xl z-50">
                      {isSearching ? (
                        <div className="p-4 text-center text-white/40 text-sm">검색 중...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map(user => {
                          const isAlreadyMember = members.some(m => m.id === user.id);
                          return (
                            <button
                              key={user.id}
                              onClick={() => !isAlreadyMember && handleInviteUser(user.id)}
                              disabled={isAlreadyMember}
                              className={clsx(
                                "w-full flex items-center gap-4 p-4 text-left transition-colors border-b border-white/5 last:border-0",
                                isAlreadyMember ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5"
                              )}
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                                {user.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-white truncate">{user.name}</span>
                                  {isAlreadyMember && (
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60">이미 소속됨</span>
                                  )}
                                </div>
                                <div className="text-xs text-white/50 truncate flex items-center gap-2">
                                  <span>{user.department}</span>
                                  <span className="w-1 h-1 rounded-full bg-white/20" />
                                  <span>{user.id}</span>
                                </div>
                              </div>
                              {!isAlreadyMember && (
                                <Plus className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-white/40 text-sm">검색 결과가 없습니다.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 pt-6 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
