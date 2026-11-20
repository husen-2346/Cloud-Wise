import { ShieldCheck, BarChart3, Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Connect securely',
      icon: <ShieldCheck size={24} className="text-brand-500" />,
      description:
        'Set up a read-only cross-account IAM Role with an External ID you control. CloudWise never asks for or stores AWS root keys or secrets.',
      highlight: 'Zero credential sharing',
    },
    {
      step: '02',
      title: 'Analyze telemetry',
      icon: <BarChart3 size={24} className="text-brand-500" />,
      description:
        'CloudWise connects via official AWS SDKs to stream live Cost Explorer spending, EC2 computing states, EBS volumes, and CloudWatch CPU telemetry.',
      highlight: '100% read-only AWS APIs',
    },
    {
      step: '03',
      title: 'Optimize & save',
      icon: <Sparkles size={24} className="text-brand-500" />,
      description:
        'Review contextual AI explanations and right-sizing suggestions. Detect idle storage, eliminate waste, and keep infrastructure costs under control.',
      highlight: 'Actionable AI summaries',
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-label="How CloudWise Works"
      className="scroll-mt-28 py-20 px-4 sm:px-6 max-w-6xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
          How CloudWise works
        </h2>
        <p className="text-body text-base mt-3 leading-relaxed">
          Connect your AWS environment in under three minutes with no agents to install,
          no binaries to compile, and complete cryptographic control.
        </p>
      </div>

      {/* Connected 3-Step Grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* Horizontal connector line on desktop */}
        <div
          className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300 -translate-y-8 pointer-events-none opacity-40 z-0"
          aria-hidden="true"
        />

        {steps.map((item) => (
          <Card
            key={item.step}
            className="relative z-10 flex flex-col justify-between hover:shadow-card hover:-translate-y-1 transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-tint flex items-center justify-center border border-brand-300/30">
                  {item.icon}
                </div>
                <span className="font-mono text-2xl font-semibold text-brand-400 select-none">
                  {item.step}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-ink mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-body leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-line">
              <span className="inline-block text-xs font-semibold text-brand-600 bg-tint/80 px-2.5 py-1 rounded-md">
                {item.highlight}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
