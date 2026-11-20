import { siteConfig } from '../../../config/site';
import { Card } from '../../../components/ui/Card';
import { Shield, Layers, Cpu, Database, CheckCircle2 } from 'lucide-react';

export function AboutSection() {
  const techStack = [
    { name: 'React 19', category: 'Frontend' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Tailwind CSS', category: 'Styling' },
    { name: 'Spring Boot 3', category: 'Backend' },
    { name: 'Java 21', category: 'Runtime' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'AWS SDK v2', category: 'Cloud API' },
    { name: 'Recharts', category: 'Telemetry' },
  ];

  const securityGuarantees = [
    'Read-only IAM policy with least privilege',
    'Zero AWS access keys, secret keys, or credentials stored',
    'External ID prevents Confused Deputy attacks',
    'Revoke access anytime from your AWS IAM console',
  ];

  return (
    <section
      id="about"
      aria-label="About CloudWise"
      className="scroll-mt-28 py-20 px-4 sm:px-6 max-w-6xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
          Built for clarity, speed, and trust
        </h2>
        <p className="text-body text-base mt-3 leading-relaxed">
          Cloud bills should not require dedicated consulting teams to decode.
          CloudWise was engineered from the ground up to give developers immediate,
          actionable insight.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Why CloudWise exists & Philosophy */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-tint flex items-center justify-center text-brand-600">
                <Layers size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Why CloudWise exists
                </h3>
                <p className="text-xs text-muted">A developer-first philosophy</p>
              </div>
            </div>

            <p className="text-sm text-body leading-relaxed mb-4">
              Modern cloud platforms are vast and complex. As engineering teams
              spin up infrastructure across regions, idle volumes, overprovisioned
              virtual machines, and orphaned snapshots quietly inflate monthly
              invoices.
            </p>
            <p className="text-sm text-body leading-relaxed mb-4">
              Existing enterprise FinOps solutions are often invasive, requiring
              heavyweight background agents, broad write permissions, and lengthy
              contract sales cycles.
            </p>
            <p className="text-sm text-body leading-relaxed font-medium text-ink">
              CloudWise takes a fundamentally different path: zero installed agents,
              instant read-only IAM connections, and generative AI explanations that
              translate raw infrastructure telemetry into clear engineering actions.
            </p>

            {/* Author info (configurable via siteConfig.author) */}
            {siteConfig.author.name ? (
              <div className="mt-6 pt-5 border-t border-line flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-semibold text-sm">
                  {siteConfig.author.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink">
                    {siteConfig.author.name}
                  </h4>
                  <p className="text-xs text-muted">{siteConfig.author.role}</p>
                </div>
              </div>
            ) : (
              <div className="mt-6 pt-5 border-t border-line">
                <p className="text-xs text-muted leading-relaxed">
                  {siteConfig.author.bio}
                </p>
              </div>
            )}
          </Card>

          {/* Security & Cryptographic Trust */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success-bg flex items-center justify-center text-success">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Security &amp; Permissions Guarantee
                </h3>
                <p className="text-xs text-muted">You retain 100% control</p>
              </div>
            </div>

            <ul className="space-y-2.5">
              {securityGuarantees.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-body">
                  <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right Column: Technology Architecture & Stack Chips */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-tint flex items-center justify-center text-brand-600">
                <Cpu size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Technology Stack
                </h3>
                <p className="text-xs text-muted">Modern, type-safe, and resilient</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-app border border-line text-xs font-medium text-ink shadow-[0_1px_2px_rgba(11,31,58,0.03)]"
                >
                  <span className="text-body font-mono">{tech.name}</span>
                  <span className="text-[10px] text-muted bg-tint/80 px-1.5 py-0.5 rounded">
                    {tech.category}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-tint flex items-center justify-center text-brand-600">
                <Database size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Architecture Overview
                </h3>
                <p className="text-xs text-muted">Clean boundary separation</p>
              </div>
            </div>

            <p className="text-xs text-body leading-relaxed">
              Built with a Spring Boot REST API layer connected to a PostgreSQL database
              storing account metadata and encrypted connection references. The React
              single-page client uses Tailwind design tokens and Recharts for smooth,
              interactive client-side rendering.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
