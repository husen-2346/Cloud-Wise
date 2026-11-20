import { StatCard } from '../../../components/ui/StatCard';
import { Card } from '../../../components/ui/Card';
import {
  DollarSign,
  Server,
  HardDrive,
  Info,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const serviceSpendData = [
  { name: 'EC2 Compute', value: 640.2, color: '#0A8BFF', pct: '45%' },
  { name: 'RDS Databases', value: 355.0, color: '#22C3EE', pct: '25%' },
  { name: 'S3 Storage', value: 213.12, color: '#6C7BFF', pct: '15%' },
  { name: 'EBS Volumes', value: 142.08, color: '#14B8A6', pct: '10%' },
  { name: 'Other Services', value: 70.4, color: '#94A3B8', pct: '5%' },
];

const cpuTelemetryData = [
  { time: '00:00', cpu: 18 },
  { time: '04:00', cpu: 14 },
  { time: '08:00', cpu: 32 },
  { time: '12:00', cpu: 46 },
  { time: '16:00', cpu: 41 },
  { time: '20:00', cpu: 28 },
  { time: '24:00', cpu: 22 },
];

interface TooltipPayload {
  name?: string;
  value?: number;
  payload?: {
    pct?: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CostTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-surface/95 backdrop-blur-md px-3 py-2 rounded-xl border border-line shadow-card text-xs">
        <p className="font-semibold text-ink">{item.name}</p>
        <p className="text-body mt-0.5">
          ${item.value?.toFixed(2)} ({item.payload?.pct})
        </p>
      </div>
    );
  }
  return null;
}

function CpuTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-surface/95 backdrop-blur-md px-3 py-2 rounded-xl border border-line shadow-card text-xs">
        <p className="font-semibold text-ink">Average CPU</p>
        <p className="text-brand-600 font-mono mt-0.5">{item.value}%</p>
      </div>
    );
  }
  return null;
}

export function InsightsSection() {
  return (
    <section
      id="insights"
      aria-label="Platform Insights Preview"
      className="scroll-mt-28 py-20 px-4 sm:px-6 max-w-6xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tint text-brand-600 text-xs font-semibold uppercase tracking-[0.12em] mb-4">
          <Info size={14} />
          <span>Platform Preview &bull; Sample data for illustration</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
          Real-time visibility into your AWS infrastructure
        </h2>
        <p className="text-body text-base mt-3 leading-relaxed">
          CloudWise streams live cost breakdowns, compute telemetry, and storage
          states directly through read-only AWS APIs.
        </p>
      </div>

      {/* Main Glass Preview Dashboard Container */}
      <div className="glass-surface rounded-[28px] p-6 sm:p-8 shadow-card border border-white/80">
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Monthly Cloud Spend"
            value="$1,420.80"
            change="-12.4% vs last month"
            changeType="positive"
            icon={<DollarSign size={20} />}
            subtitle="Calculated from Cost Explorer"
          />
          <StatCard
            label="Active EC2 Instances"
            value="14"
            change="3 underutilized"
            changeType="neutral"
            icon={<Server size={20} />}
            subtitle="Across 2 active AWS regions"
          />
          <StatCard
            label="Idle EBS Volumes"
            value="3"
            change="Save $42.60/mo"
            changeType="positive"
            icon={<HardDrive size={20} />}
            subtitle="Unattached block storage"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart: Cost by Service */}
          <Card className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Cost by Service
                </h3>
                <p className="text-xs text-muted">Current billing period</p>
              </div>
              <span className="text-xs font-mono font-medium text-body bg-tint px-2.5 py-1 rounded-full">
                $1,420.80 Total
              </span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceSpendData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {serviceSpendData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CostTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-line mt-2">
              {serviceSpendData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-body truncate">{item.name}</span>
                  <span className="text-muted font-mono ml-auto">
                    {item.pct}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Area Chart: 24h Average CPU Utilization */}
          <Card className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-ink">
                  EC2 CPU Telemetry
                </h3>
                <p className="text-xs text-muted">
                  CloudWatch 24-hour fleet average
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-success bg-success-bg px-2.5 py-1 rounded-full">
                28.6% Avg
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={cpuTelemetryData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A8BFF" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0A8BFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                    unit="%"
                    domain={[0, 60]}
                  />
                  <Tooltip content={<CpuTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#0A8BFF"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#cpuGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-4 border-t border-line mt-2 flex items-center justify-between text-xs text-muted">
              <span>Peak: 46% (12:00)</span>
              <span>Off-peak: 14% (04:00)</span>
              <span className="text-brand-600 font-medium">3 idle nodes detected</span>
            </div>
          </Card>
        </div>

        {/* AI Insight Callout Card */}
        <div className="mt-6 rounded-2xl bg-tint/60 border border-brand-300/40 p-4 sm:p-5 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink">
              AI Optimization Recommendation
            </h4>
            <p className="text-xs sm:text-sm text-body mt-1 leading-relaxed">
              3 unattached <code className="font-mono text-brand-600">gp2</code> EBS volumes in{' '}
              <code className="font-mono text-ink">us-east-1</code> have recorded 0 IOPS for over 14 days. Creating snapshots and deleting the idle volumes will reduce monthly storage spend by{' '}
              <strong className="text-ink font-semibold">$42.60</strong> without impacting any running workloads.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
