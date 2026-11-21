import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  fetchCpuMetrics,
  type Ec2InstanceResponse,
  type CloudWatchMetricResponse,
} from '../../../services/awsApi';
import { Badge, type BadgeVariant } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  X,
  Copy,
  Check,
  Activity,
  Calendar,
  Globe,
  Network,
  Cpu,
  MapPin,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Ec2DetailDrawerProps {
  instance: Ec2InstanceResponse | null;
  connectionId: number;
  onClose: () => void;
}

interface CpuPoint {
  time: string;
  average: number | null;
  maximum: number | null;
}

function processInstanceCpu(
  metrics: CloudWatchMetricResponse[],
  durationHours: number,
  bucketMinutes: number,
): CpuPoint[] {
  const now = new Date();
  const startTime = new Date(now.getTime() - durationHours * 60 * 60 * 1000);
  const bucketMs = bucketMinutes * 60 * 1000;
  const totalBuckets = Math.ceil((durationHours * 60) / bucketMinutes);

  const bucketAvgs: number[][] = Array.from({ length: totalBuckets }, () => []);
  const bucketMaxs: number[][] = Array.from({ length: totalBuckets }, () => []);

  metrics.forEach((m) => {
    const pointTime = new Date(m.timestamp).getTime();
    const offsetMs = pointTime - startTime.getTime();
    if (offsetMs >= 0) {
      const idx = Math.min(Math.floor(offsetMs / bucketMs), totalBuckets - 1);
      if (m.average !== null && m.average !== undefined) {
        bucketAvgs[idx].push(m.average);
      }
      if (m.maximum !== null && m.maximum !== undefined) {
        bucketMaxs[idx].push(m.maximum);
      }
    }
  });

  const points: CpuPoint[] = [];
  for (let i = 0; i < totalBuckets; i++) {
    const bucketTime = new Date(startTime.getTime() + i * bucketMs);
    const timeLabel =
      durationHours === 24
        ? bucketTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        : bucketTime.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

    const avgs = bucketAvgs[i];
    const maxs = bucketMaxs[i];

    const avgVal =
      avgs.length > 0 ? Number((avgs.reduce((s, v) => s + v, 0) / avgs.length).toFixed(2)) : null;
    const maxVal =
      maxs.length > 0 ? Number(Math.max(...maxs).toFixed(2)) : null;

    points.push({
      time: timeLabel,
      average: avgVal,
      maximum: maxVal,
    });
  }

  return points;
}

export function Ec2DetailDrawer({
  instance,
  connectionId,
  onClose,
}: Ec2DetailDrawerProps) {
  const { token } = useAuth();
  const [copied, setCopied] = useState(false);

  // 24h & 7d CPU state
  const [cpu24h, setCpu24h] = useState<CpuPoint[]>([]);
  const [cpu7d, setCpu7d] = useState<CpuPoint[]>([]);
  const [hasPoints24h, setHasPoints24h] = useState<boolean>(false);
  const [hasPoints7d, setHasPoints7d] = useState<boolean>(false);
  const [loading24h, setLoading24h] = useState<boolean>(true);
  const [loading7d, setLoading7d] = useState<boolean>(true);
  const [error24h, setError24h] = useState<string | null>(null);
  const [error7d, setError7d] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch 24h and 7d CPU metrics
  useEffect(() => {
    if (!token || !instance) return;

    let cancelled = false;
    const now = new Date();
    const endIso = now.toISOString();

    // 24h (30 min buckets)
    const start24hIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    fetchCpuMetrics(token, connectionId, instance.instanceId, start24hIso, endIso)
      .then((data) => {
        if (cancelled) return;
        setHasPoints24h(data.length > 0);
        setCpu24h(processInstanceCpu(data, 24, 30));
        setError24h(null);
      })
      .catch((err) => {
        if (!cancelled) setError24h(err instanceof Error ? err.message : 'Failed to fetch 24h CPU');
      })
      .finally(() => {
        if (!cancelled) setLoading24h(false);
      });

    // 7d (3 hour buckets)
    const start7dIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    fetchCpuMetrics(token, connectionId, instance.instanceId, start7dIso, endIso)
      .then((data) => {
        if (cancelled) return;
        setHasPoints7d(data.length > 0);
        setCpu7d(processInstanceCpu(data, 7 * 24, 3 * 60));
        setError7d(null);
      })
      .catch((err) => {
        if (!cancelled) setError7d(err instanceof Error ? err.message : 'Failed to fetch 7d CPU');
      })
      .finally(() => {
        if (!cancelled) setLoading7d(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, connectionId, instance]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!instance) return null;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(instance.instanceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const stateVariant: BadgeVariant =
    instance.state.toLowerCase() === 'running'
      ? 'running'
      : instance.state.toLowerCase() === 'stopped'
      ? 'stopped'
      : 'pending';

  const formattedLaunchTime = instance.launchTime
    ? new Date(instance.launchTime).toLocaleString()
    : '—';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="EC2 Instance Details"
        className="w-full max-w-xl bg-surface border-l border-line shadow-2xl h-full flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between p-6 border-b border-line bg-app/30">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h2 className="text-xl font-semibold text-ink">
                {instance.name || 'Unnamed Instance'}
              </h2>
              <Badge variant={stateVariant}>{instance.state}</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <span>{instance.instanceId}</span>
              <button
                type="button"
                onClick={handleCopyId}
                aria-label="Copy instance ID"
                className="text-brand-600 hover:text-brand-500 transition-colors p-0.5"
              >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-line/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-app/50 border border-line text-xs">
            <div className="flex items-start gap-2.5">
              <Cpu size={16} className="text-brand-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-muted block">Instance Type</span>
                <span className="font-semibold text-ink font-mono">{instance.instanceType}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-brand-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-muted block">Availability Zone</span>
                <span className="font-semibold text-ink">{instance.availabilityZone}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Globe size={16} className="text-brand-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-muted block">Public IP</span>
                <span className="font-mono text-ink">{instance.publicIpAddress || '—'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Network size={16} className="text-brand-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-muted block">Private IP</span>
                <span className="font-mono text-ink">{instance.privateIpAddress || '—'}</span>
              </div>
            </div>

            <div className="col-span-2 flex items-start gap-2.5 pt-2 border-t border-line/60">
              <Calendar size={16} className="text-brand-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-muted block">Launch Time</span>
                <span className="text-ink">{formattedLaunchTime}</span>
              </div>
            </div>
          </div>

          {/* CPU Chart: Last 24 Hours */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-ink">
                CPU Utilization — Last 24 Hours
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-line min-h-[220px] flex items-center justify-center">
              {loading24h ? (
                <div className="w-full space-y-2">
                  <Skeleton height="160px" width="100%" />
                </div>
              ) : error24h ? (
                <p className="text-xs text-danger">{error24h}</p>
              ) : !hasPoints24h ? (
                <EmptyState
                  icon={<Activity size={18} />}
                  title="No CPU data"
                  description="No CloudWatch metric points recorded in the last 24 hours."
                />
              ) : (
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cpu24h} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#CBD5E1' }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#CBD5E1' }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-surface/95 backdrop-blur-md px-3 py-2 rounded-xl border border-line shadow-card text-xs">
                                <p className="text-muted mb-1">{payload[0].payload.time}</p>
                                <p className="text-brand-600 font-mono">
                                  Average: {payload[0].value !== null ? `${payload[0].value}%` : '—'}
                                </p>
                                <p className="text-[#22C3EE] font-mono">
                                  Maximum: {payload[1]?.value !== null ? `${payload[1]?.value}%` : '—'}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                      <Line
                        type="monotone"
                        dataKey="average"
                        name="Average CPU"
                        stroke="#0A8BFF"
                        strokeWidth={2}
                        dot={false}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="maximum"
                        name="Maximum CPU"
                        stroke="#22C3EE"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        dot={false}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* CPU Chart: Last 7 Days */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-brand-500" />
              <h3 className="text-sm font-semibold text-ink">
                CPU Utilization — Last 7 Days
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-line min-h-[220px] flex items-center justify-center">
              {loading7d ? (
                <div className="w-full space-y-2">
                  <Skeleton height="160px" width="100%" />
                </div>
              ) : error7d ? (
                <p className="text-xs text-danger">{error7d}</p>
              ) : !hasPoints7d ? (
                <EmptyState
                  icon={<Activity size={18} />}
                  title="No CPU data"
                  description="No CloudWatch metric points recorded in the last 7 days."
                />
              ) : (
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cpu7d} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="time" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#CBD5E1' }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#CBD5E1' }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-surface/95 backdrop-blur-md px-3 py-2 rounded-xl border border-line shadow-card text-xs">
                                <p className="text-muted mb-1">{payload[0].payload.time}</p>
                                <p className="text-brand-600 font-mono">
                                  Average: {payload[0].value !== null ? `${payload[0].value}%` : '—'}
                                </p>
                                <p className="text-[#22C3EE] font-mono">
                                  Maximum: {payload[1]?.value !== null ? `${payload[1]?.value}%` : '—'}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                      <Line
                        type="monotone"
                        dataKey="average"
                        name="Average CPU"
                        stroke="#0A8BFF"
                        strokeWidth={2}
                        dot={false}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="maximum"
                        name="Maximum CPU"
                        stroke="#22C3EE"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        dot={false}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-line bg-app/30 flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
