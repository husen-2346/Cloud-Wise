import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';
import { Button } from '../ui/Button';
import { Menu, X } from 'lucide-react';

export function PublicNavbar() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  const navLinks = [
    { label: 'Insights', href: '#insights', id: 'insights' },
    { label: 'How it works', href: '#how-it-works', id: 'how-it-works' },
    { label: 'Features', href: '#features', id: 'features' },
    { label: 'About', href: '#about', id: 'about' },
  ];

  // Active section tracking using IntersectionObserver
  useEffect(() => {
    const sectionIds = ['insights', 'how-it-works', 'features', 'about'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        {
          rootMargin: '-20% 0px -60% 0px',
          threshold: 0.1,
        },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-5 left-0 right-0 z-50 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <nav
          className="glass-surface rounded-full px-5 py-2.5 shadow-[0_4px_24px_-4px_rgba(11,31,58,0.08)] flex items-center justify-between"
          aria-label="Main Navigation"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Centered Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className={`text-sm transition-colors duration-150 ${
                    isActive
                      ? 'text-ink font-semibold'
                      : 'text-body font-medium hover:text-ink'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/app/overview')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-ink hover:text-brand-500 transition"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mt-2 glass-surface rounded-[20px] p-5 shadow-card flex flex-col gap-4 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={`text-sm py-1.5 ${
                  activeSection === link.id
                    ? 'text-ink font-semibold'
                    : 'text-body font-medium'
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-line">
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/app/overview');
                  }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
