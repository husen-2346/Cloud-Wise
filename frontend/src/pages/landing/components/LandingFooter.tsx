import { Link } from 'react-router-dom';
import { Logo } from '../../../components/brand/Logo';
import { ShieldCheck } from 'lucide-react';

export function LandingFooter() {
  const navLinks = [
    { label: 'Insights', href: '#insights' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-line bg-surface/50 mt-12 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-line">
          {/* Logo & Platform Tagline */}
          <div className="space-y-2">
            <Logo size="md" />
            <p className="text-xs text-muted max-w-sm">
              AI-powered cloud cost and resource optimization platform.
              Streamlining AWS infrastructure with zero credential storage.
            </p>
          </div>

          {/* Quick Anchor Navigation */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-sm font-medium text-body hover:text-ink transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              className="text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Security statement & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-success flex-shrink-0" />
            <span>Read-only access through an IAM role you control.</span>
          </div>

          <p>
            &copy; {new Date().getFullYear()} CloudWise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
