import { useState, useRef, useEffect, type ReactNode } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';
import {
  LayoutDashboard,
  Server,
  HardDrive,
  BarChart3,
  Sparkles,
  History,
  Settings,
  Cloud,
  LogOut,
  ChevronDown,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

type NavSingle = {
  type?: 'link';
  label: string;
  to: string;
  icon: LucideIcon;
};

type NavGroup = {
  type: 'group';
  group: string;
  items: { label: string; to: string; icon: LucideIcon }[];
};

type NavItem = NavSingle | NavGroup;

const navItems: NavItem[] = [
  { label: 'Overview', to: '/app/overview', icon: LayoutDashboard },
  { label: 'Cloud Accounts', to: '/app/accounts', icon: Cloud },
  {
    type: 'group',
    group: 'Resources',
    items: [
      { label: 'EC2 Instances', to: '/app/resources/ec2', icon: Server },
      { label: 'EBS Volumes', to: '/app/resources/ebs', icon: HardDrive },
    ],
  },
  { label: 'Cost & Usage', to: '/app/cost', icon: BarChart3 },
  { label: 'AI Insights', to: '/app/insights', icon: Sparkles },
  { label: 'History', to: '/app/history', icon: History },
];

interface SidebarContentProps {
  onItemClick?: () => void;
}

function SidebarContent({ onItemClick }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-surface border-r border-line p-5">
      {/* Brand Header */}
      <div className="pb-6 border-b border-line">
        <Link to="/app/overview" className="block" onClick={onItemClick}>
          <Logo size="md" />
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto" aria-label="Sidebar Navigation">
        {navItems.map((item, idx) => {
          if ('type' in item && item.type === 'group') {
            return (
              <div key={idx} className="pt-4 pb-1">
                <span className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted select-none">
                  {item.group}
                </span>
                <div className="mt-2 space-y-1">
                  {item.items.map((sub) => {
                    const Icon = sub.icon;
                    return (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        onClick={onItemClick}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-colors select-none ${
                            isActive
                              ? 'bg-tint text-brand-600 font-semibold'
                              : 'text-body hover:bg-tint/50 hover:text-ink'
                          }`
                        }
                      >
                        <Icon size={18} className="shrink-0" />
                        <span>{sub.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          }

          const singleItem = item as NavSingle;
          const Icon = singleItem.icon;
          return (
            <NavLink
              key={singleItem.to}
              to={singleItem.to}
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-colors select-none ${
                  isActive
                    ? 'bg-tint text-brand-600 font-semibold'
                    : 'text-body hover:bg-tint/50 hover:text-ink'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{singleItem.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Pinned Settings Link */}
      <div className="pt-4 border-t border-line">
        <NavLink
          to="/app/settings"
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-colors select-none ${
              isActive
                ? 'bg-tint text-brand-600 font-semibold'
                : 'text-body hover:bg-tint/50 hover:text-ink'
            }`
          }
        >
          <Settings size={18} className="shrink-0" />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = (userName.charAt(0) || 'U').toUpperCase();

  const handleSignOut = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-app flex">
      {/* Desktop Sidebar: 248px fixed at 1024px and above */}
      <aside className="hidden lg:block w-[248px] shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (Below 1024px) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/20 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[280px] max-w-[80vw] h-full bg-surface shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted hover:text-ink transition"
            >
              <X size={20} />
            </button>
            <SidebarContent onItemClick={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 lg:pl-[248px] flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 bg-surface/80 backdrop-blur-md border-b border-line px-6 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              aria-label="Open sidebar menu"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 text-ink hover:text-brand-500 transition -ml-2"
            >
              <Menu size={22} />
            </button>
            <Logo size="sm" iconOnly />
          </div>

          <div className="hidden lg:block">
            {/* Context Breadcrumb or Workspace Identifier */}
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              CloudWise Workspace
            </span>
          </div>

          {/* Top-Right User Area */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 p-1.5 rounded-full hover:bg-tint transition select-none"
            >
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-sans text-xs font-semibold flex items-center justify-center shadow-sm">
                {userInitial}
              </div>
              <span className="text-sm font-medium text-ink hidden sm:inline-block max-w-[120px] truncate">
                {userName}
              </span>
              <ChevronDown size={14} className="text-muted" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-[16px] bg-surface border border-line shadow-card p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-2 border-b border-line mb-1">
                  <p className="text-xs text-muted">Signed in as</p>
                  <p className="text-xs font-semibold text-ink truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/app/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-body hover:bg-tint hover:text-ink transition"
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-danger hover:bg-danger-bg transition"
                >
                  <LogOut size={15} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* App-Haze Background Header Band */}
        <div
          className="relative w-full h-[260px] -mb-[260px] pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="w-full h-full bg-gradient-to-b from-[#BFE3FF]/50 via-[#EAF5FF]/30 to-transparent"
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            }}
          />
        </div>

        {/* Main Content Area (Max width 1280px) */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto p-6 md:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
