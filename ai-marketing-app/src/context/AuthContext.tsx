import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  department: string
  role: 'admin' | 'user'
}

interface Team {
  id: string
  name: string
  description: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  currentTeam: Team | null
  teams: Team[]
  login: (id: string, password: string) => Promise<void>
  logout: () => void
  setCurrentTeam: (team: Team) => void
  refreshTeams: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeamState] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTeams = async (authToken: string) => {
    try {
      const res = await fetch('/teams', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      if (res.ok) {
        const data = await res.json()
        setTeams(data)
        if (data.length > 0) {
          const storedTeamId = localStorage.getItem('synthetix_current_team_id')
          const teamToSet = data.find((t: Team) => t.id === storedTeamId) || data[0]
          setCurrentTeamState(teamToSet)
        }
      }
    } catch (err) {
      console.error('Failed to fetch teams', err)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('synthetix_token')
    const storedUser = localStorage.getItem('synthetix_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      fetchTeams(storedToken)
    }
    setIsLoading(false)
  }, [])

  const setCurrentTeam = (team: Team) => {
    setCurrentTeamState(team)
    localStorage.setItem('synthetix_current_team_id', team.id)
  }

  const refreshTeams = async () => {
    if (token) await fetchTeams(token)
  }

  const login = async (id: string, password: string) => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || '로그인 실패')
    }
    const data = await res.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('synthetix_token', data.token)
    localStorage.setItem('synthetix_user', JSON.stringify(data.user))
    await fetchTeams(data.token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setTeams([])
    setCurrentTeamState(null)
    localStorage.removeItem('synthetix_token')
    localStorage.removeItem('synthetix_user')
    localStorage.removeItem('synthetix_current_team_id')
  }

  return (
    <AuthContext.Provider value={{ 
      user, token, currentTeam, teams, login, logout, 
      setCurrentTeam, refreshTeams, isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
