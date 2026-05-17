import { Search, Bell, History, UserCircle } from 'lucide-react'

interface HeaderProps {
  title: string;
  breadcrumbs: { label: string; active?: boolean }[];
  rightSlot?: React.ReactNode;
}

export function Header({ title, breadcrumbs, rightSlot }: HeaderProps) {
  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-xl z-40 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-primary-container tracking-tight">{title}</h2>
        <div className="h-4 w-px bg-white/10 mx-2" />
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
          {breadcrumbs.map((crumb, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`hover:text-primary transition-colors cursor-pointer ${crumb.active ? 'text-on-surface font-medium' : ''}`}>
                {crumb.label}
              </span>
              {i < breadcrumbs.length - 1 && <span className="text-[10px] opacity-30">/</span>}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <IconButton icon={<Search size={20} />} />
          <IconButton icon={<Bell size={20} />} badge />
          <IconButton icon={<History size={20} />} />
          <div className="h-8 w-px bg-white/10 mx-2" />
          {rightSlot || (
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-white/10 overflow-hidden cursor-pointer hover:ring-2 ring-primary/30 transition-all">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function IconButton({ icon, badge }: { icon: React.ReactNode, badge?: boolean }) {
  return (
    <button className="relative text-on-surface-variant hover:text-on-surface hover:bg-white/5 p-2 rounded-xl transition-all active:scale-95">
      {icon}
      {badge && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-background" />}
    </button>
  )
}
