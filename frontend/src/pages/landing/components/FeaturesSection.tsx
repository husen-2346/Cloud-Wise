import {
  PieChart as PieChartIcon,
  Server,
  Activity,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export function FeaturesSection() {
  const features = [
    {
      title: 'Cost by Service',
      badge: 'available' as const,
      badgeText: 'Available',
      icon: <PieChartIcon size={22} className="text-brand-500" />,
      description:
        'Query AWS Cost Explorer to break down spending by individual AWS service, track month-to-date trajectory, and identify billing shifts.',
    },
    {
      title: 'EC2 & EBS Inventory',
      badge: 'available' as const,
      badgeText: 'Available',
      icon: <Server size={22} className="text-brand-500" />,
      description:
        'Instant multi-region discovery of running and stopped EC2 instances, attached and orphaned EBS volumes, and storage waste.',
    },
    {
      title: 'CPU Utilization Metrics',
      badge: 'available' as const,
      badgeText: 'Available',
      icon: <Activity size={22} className="text-brand-500" />,
      description:
        'Live CloudWatch metric aggregation. View average and peak CPU loads across your fleet to reliably pinpoint oversized compute instances.',
    },
    {
      title: 'AI Explanations',
      badge: 'available' as const,
      badgeText: 'Available',
      icon: <Sparkles size={22} className="text-brand-500" />,
      description:
        'Transform complex infrastructure data into plain-English root cause summaries and prioritized recommendations powered by AI.',
    },
    {
      title: 'Automated Anomaly Detection',
      badge: 'coming-soon' as const,
      badgeText: 'Coming soon',
      icon: <Zap size={22} className="text-muted" />,
      description:
        'Continuous baseline monitoring that automatically alerts your engineering team when sudden unexpected cost spikes or resource leaks occur.',
    },
    {
      title: 'Predictive Cost Forecasting',
      badge: 'coming-soon' as const,
      badgeText: 'Coming soon',
      icon: <TrendingUp size={22} className="text-muted" />,
      description:
        'Statistical forecasting and budget projection models to anticipate end-of-month cloud invoices before billing cutoffs.',
    },
  ];

  return (
    <section
      id="features"
      aria-label="Features and Capabilities"
      className="scroll-mt-28 py-20 px-4 sm:px-6 max-w-6xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
          Comprehensive cloud visibility
        </h2>
        <p className="text-body text-base mt-3 leading-relaxed">
          Engineered for developers, platform engineers, and engineering managers
          who demand accurate cloud telemetry without heavyweight tooling.
        </p>
      </div>

      {/* 3x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item) => (
          <Card
            key={item.title}
            className="flex flex-col justify-between hover:shadow-card hover:-translate-y-1 transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-tint flex items-center justify-center">
                  {item.icon}
                </div>
                <Badge variant={item.badge}>{item.badgeText}</Badge>
              </div>

              <h3 className="text-base font-semibold text-ink mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-body leading-relaxed">
                {item.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
