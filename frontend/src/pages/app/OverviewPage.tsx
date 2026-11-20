import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useConnections, type ConnectionMetadata } from '../../context/ConnectionsContext';
import { useEc2Instances } from '../../hooks/useEc2Instances';
import { useEbsVolumes } from '../../hooks/useEbsVolumes';
import { useServiceCosts } from '../../hooks/useServiceCosts';
import { useCpuMetrics } from '../../hooks/useCpuMetrics';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Cloud,
  Server,
  HardDrive,
  DollarSign,
  RefreshCw,
  Plus,
  Info,
  AlertCircle,
  Activity,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Chart Color Palette from DESIGN.md
const CHART_COLORS = [
  '#0A8BFF', // chart-1
  '#22C3EE', // chart-2
  '#6C7BFF', // chart-3
  '#14B8A6', // chart-4
  '#94A3B8', // chart-5
  '#CBD5E1', // chart-other
];

// Helper to generate calendar month options (Current month + 5 previous months)
function getMonthOptions() {
  const options = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });

    const startMonthStr = String(month + 1).padStart(2, '0');
    const startDate = `${year}-${startMonthStr}-01`;

    const nextMonth = new Date(year, month + 1, 1);
    const nextYear = nextMonth.getFullYear();
    const nextMonthStr = String(nextMonth.getMonth() + 1).padStart(2, '0');
    const endDate = `${nextYear}-${nextMonthStr}-01`;

    options.push({
      value: `${startDate}:${endDate}`,
      label,
      startDate,
      endDate,
    });
  }

  return options;
}

export default function OverviewPage() {
  const { connections, activeConnection, setActive } = useConnections();

  // Filter only CONNECTED AWS connections
  const connectedAccounts = useMemo(
    () => connections.filter((c) => c.status === 'CONNECTED'),
    [connections],
  );

  // Active connection selection logic
  const selectedConnection: ConnectionMetadata | null = useMemo(() => {
    if (connectedAccounts.length === 0) return null;
    const match = connectedAccounts.find(
      (c) => c.connectionId === activeConnection?.connectionId,
    );
    return match || connectedAccounts[0];
  }, [connectedAccounts, activeConnection]);

  // Sync active connection in context if needed
  useEffect(() => {
    if (selectedConnection && selectedConnection.connectionId !== activeConnection?.connectionId) {
      setActive(selectedConnection.connectionId);
    }
  }, [selectedConnection, activeConnection, setActive]);

  const selectedConnectionId = selectedConnection?.connectionId ?? null;

  // Header Refresh & Timestamp State
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Month selector for Cost by Service
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const [selectedMonthRange, setSelectedMonthRange] = useState<string>(
    monthOptions[0]?.value || '',
  );

  const [activeStartDate, activeEndDate] = useMemo(() => {
    if (!selectedMonthRange) {
      const fallback = monthOptions[0];
      return [fallback.startDate, fallback.endDate];
    }
    const [start, end] = selectedMonthRange.split(':');
    return [start, end];
  }, [selectedMonthRange, monthOptions]);

  // Current month date boundaries for the StatCard (Month-to-date)
  const currentMonthStart = monthOptions[0]?.startDate || '';
  const currentMonthEnd = monthOptions[0]?.endDate || '';

  // Data Hooks
  const {
    instances,
    isLoading: instancesLoading,
    error: instancesError,
    refetch: refetchInstances,
  } = useEc2Instances(selectedConnectionId);

  const {
    volumes,
    isLoading: volumesLoading,
    error: volumesError,
    refetch: refetchVolumes,
  } = useEbsVolumes(selectedConnectionId);

  // Current month costs for StatCard
  const {
    costs: currentMonthCosts,
    isLoading: currentCostsLoading,
    refetch: refetchCurrentCosts,
  } = useServiceCosts(selectedConnectionId, currentMonthStart, currentMonthEnd);

  // Selected month costs for Donut Chart
  const {
    costs: selectedMonthCosts,
    isLoading: selectedCostsLoading,
    error: costsError,
    refetch: refetchSelectedCosts,
  } = useServiceCosts(selectedConnectionId, activeStartDate, activeEndDate);

  // CPU Chart Controls
  const [cpuTimeRange, setCpuTimeRange] = useState<'24h' | '7d'>('24h');
  const [selectedCpuInstanceId, setSelectedCpuInstanceId] = useState<string>('all');

  const runningInstances = useMemo(
    () => instances.filter((i) => i.state.toLowerCase() === 'running'),
    [instances],
  );

  const {
    chartData: cpuChartData,
    rawPointsCount: cpuPointsCount,
    isLoading: cpuLoading,
    error: cpuError,
    refetch: refetchCpu,
  } = useCpuMetrics(
    selectedConnectionId,
    runningInstances,
    cpuTimeRange,
    selectedCpuInstanceId,
  );

  // Handle Full Page Refresh
  const handleFullRefresh = useCallback(async () => {
    if (isRefreshing || !selectedConnectionId) return;
    setIsRefreshing(true);

    try {
      await Promise.all([
        refetchInstances(),
        refetchVolumes(),
        refetchCurrentCosts(true),
        refetchSelectedCosts(true),
        refetchCpu(),
      ]);

      setLastUpdated(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [
    isRefreshing,
    selectedConnectionId,
    refetchInstances,
    refetchVolumes,
    refetchCurrentCosts,
    refetchSelectedCosts,
    refetchCpu,
  ]);

  // Derived EC2 & EBS counts
  const runningEc2Count = runningInstances.length;
  const attachedEbsCount = useMemo(
    () =>
      volumes.filter(
        (v) => (v.attachedInstanceIds && v.attachedInstanceIds.length > 0) || v.state === 'in-use',
      ).length,
    [volumes],
  );

  // Derived Monthly Cost StatCard calculations
  const { formattedMonthCost, monthlyCostSubtitle } = useMemo(() => {
    if (currentCostsLoading) {
      return { formattedMonthCost: null, monthlyCostSubtitle: 'Loading...' };
    }

    if (currentMonthCosts.length === 0) {
      return {
        formattedMonthCost: '$0.00',
        monthlyCostSubtitle: 'No billing data',
      };
    }

    const total = currentMonthCosts.reduce((sum, item) => sum + (item.amount || 0), 0);
    const unit = currentMonthCosts[0]?.unit || 'USD';

    if (unit === 'USD') {
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(total);
      return { formattedMonthCost: formatted, monthlyCostSubtitle: 'Month-to-date spend' };
    }

    return {
      formattedMonthCost: `${total.toFixed(2)} ${unit}`,
      monthlyCostSubtitle: `Month-to-date (${unit})`,
    };
  }, [currentMonthCosts, currentCostsLoading]);

  // Derived Cost by Service Donut Data
  const { donutData, totalSelectedCost, costUnit } = useMemo(() => {
    if (selectedMonthCosts.length === 0) {
      return { donutData: [], totalSelectedCost: 0, costUnit: 'USD' };
    }

    const unit = selectedMonthCosts[0]?.unit || 'USD';

    // Group costs by service name
    const serviceMap = new Map<string, number>();
    selectedMonthCosts.forEach((item) => {
      const current = serviceMap.get(item.service) || 0;
      serviceMap.set(item.service, current + (item.amount || 0));
    });

    // Sort descending
    const sorted = Array.from(serviceMap.entries())
      .map(([service, amount]) => ({ service, amount }))
      .sort((a, b) => b.amount - a.amount);

    const total = sorted.reduce((sum, s) => sum + s.amount, 0);

    // Take top 5, combine remainder into 'Other'
    const top5 = sorted.slice(0, 5);
    const remaining = sorted.slice(5);

    const finalData = top5.map((item, idx) => ({
      name: item.service,
      value: Number(item.amount.toFixed(2)),
      color: CHART_COLORS[idx % CHART_COLORS.length],
      percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) + '%' : '0%',
    }));

    if (remaining.length > 0) {
      const otherTotal = remaining.reduce((sum, r) => sum + r.amount, 0);
      finalData.push({
        name: 'Other',
        value: Number(otherTotal.toFixed(2)),
        color: CHART_COLORS[CHART_COLORS.length - 1],
        percentage: total > 0 ? ((otherTotal / total) * 100).toFixed(1) + '%' : '0%',
      });
    }

    return { donutData: finalData, totalSelectedCost: total, costUnit: unit };
  }, [selectedMonthCosts]);

  // NO CONNECTED ACCOUNTS STATE
  if (connectedAccounts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Card>
          <EmptyState
            icon={<Cloud size={28} />}
            title="Connect your AWS account"
            description="An active AWS connection is required before infrastructure and cost telemetry can be displayed. Connect using read-only IAM role delegation."
            action={
              <Link to="/app/connect">
                <Button variant="primary" size="lg" leftIcon={<Plus size={18} />}>
                  Connect AWS account
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PageHeader with Account Switcher, Timestamp, and Refresh Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-line">
        <div>
          <h1 className="font-serif text-3xl font-normal text-ink tracking-tight">
            Overview
          </h1>
          <p className="text-body text-sm mt-1">
            A consolidated view of your cloud infrastructure, usage, and costs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Account Switcher (Only if > 1 connected accounts) */}
          {connectedAccounts.length > 1 && (
            <div className="w-64">
              <Select
                id="accountSwitcher"
                aria-label="Switch AWS Account"
                value={selectedConnection?.connectionId || ''}
                onChange={(e) => setActive(Number(e.target.value))}
              >
                {connectedAccounts.map((acc) => (
                  <option key={acc.connectionId} value={acc.connectionId}>
                    {acc.label || acc.accountId} ({acc.accountId})
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Last Updated Timestamp */}
          <span className="text-xs text-muted select-none">
            Updated {lastUpdated}
          </span>

          {/* Refresh Button */}
          <Button
            variant="secondary"
            size="md"
            aria-label="Refresh dashboard data"
            onClick={handleFullRefresh}
            disabled={isRefreshing}
            leftIcon={
              <RefreshCw
                size={15}
                className={isRefreshing ? 'animate-spin text-brand-600' : ''}
              />
            }
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Row of Four StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cloud Accounts (Global count across user) */}
        <StatCard
          label="Cloud Accounts"
          value={connectedAccounts.length}
          change="Connected"
          changeType="positive"
          icon={<Cloud size={18} className="text-brand-500" />}
          subtitle="Saved in this browser"
        />

        {/* Card 2: EC2 Instances */}
        {instancesError ? (
          <Card className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                EC2 Instances
              </span>
              <p className="text-xs text-danger mt-2">{instancesError}</p>
            </div>
            <Button
              variant="ghost"
              size="md"
              onClick={refetchInstances}
              className="mt-3 text-xs w-full justify-start p-0 h-auto"
            >
              Retry
            </Button>
          </Card>
        ) : (
          <StatCard
            label="EC2 Instances"
            value={instances.length}
            isLoading={instancesLoading}
            subtitle={`${runningEc2Count} running`}
            icon={<Server size={18} className="text-brand-500" />}
          />
        )}

        {/* Card 3: EBS Volumes */}
        {volumesError ? (
          <Card className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                EBS Volumes
              </span>
              <p className="text-xs text-danger mt-2">{volumesError}</p>
            </div>
            <Button
              variant="ghost"
              size="md"
              onClick={refetchVolumes}
              className="mt-3 text-xs w-full justify-start p-0 h-auto"
            >
              Retry
            </Button>
          </Card>
        ) : (
          <StatCard
            label="EBS Volumes"
            value={volumes.length}
            isLoading={volumesLoading}
            subtitle={`${attachedEbsCount} attached`}
            icon={<HardDrive size={18} className="text-brand-500" />}
          />
        )}

        {/* Card 4: Monthly Cost (Highlighted with brand border) */}
        <StatCard
          label="Monthly Cost"
          value={formattedMonthCost}
          isLoading={currentCostsLoading}
          subtitle={monthlyCostSubtitle}
          icon={<DollarSign size={18} className="text-brand-500" />}
          className="border-brand-500/60 shadow-[0_4px_20px_-4px_rgba(10,139,255,0.12)]"
        />
      </div>

      {/* Main Charts Grid: CPU Utilization (left) + Cost by Service (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CPU Utilization Card */}
        <Card className="lg:col-span-7 xl:col-span-7 flex flex-col">
          {/* Card Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-line">
            <div>
              <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                <Activity size={18} className="text-brand-500" />
                CPU Utilization (Average)
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {selectedCpuInstanceId === 'all'
                  ? 'Average across up to 5 running instances.'
                  : `Instance: ${selectedCpuInstanceId}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Time Range Selector */}
              <div className="w-36">
                <Select
                  id="cpuTimeRange"
                  aria-label="CPU Time Range"
                  value={cpuTimeRange}
                  onChange={(e) => setCpuTimeRange(e.target.value as '24h' | '7d')}
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                </Select>
              </div>

              {/* Running Instance Selector */}
              <div className="w-48">
                <Select
                  id="cpuInstanceSelect"
                  aria-label="Select Instance for CPU"
                  value={selectedCpuInstanceId}
                  disabled={runningInstances.length === 0}
                  onChange={(e) => setSelectedCpuInstanceId(e.target.value)}
                >
                  <option value="all">All running instances (avg)</option>
                  {runningInstances.map((inst) => (
                    <option key={inst.instanceId} value={inst.instanceId}>
                      {inst.name || inst.instanceId}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Chart Content Area */}
          <div className="min-h-[280px] w-full flex items-center justify-center">
            {cpuLoading ? (
              <div className="w-full space-y-3 py-6">
                <Skeleton height="200px" width="100%" />
              </div>
            ) : cpuError ? (
              <div className="text-center py-10 space-y-3">
                <AlertCircle size={24} className="text-danger mx-auto" />
                <p className="text-xs text-danger">{cpuError}</p>
                <Button variant="secondary" size="md" onClick={refetchCpu}>
                  Retry
                </Button>
              </div>
            ) : runningInstances.length === 0 ? (
              <EmptyState
                icon={<Server size={22} />}
                title="No running instances"
                description="Launch or start an EC2 instance in AWS to stream CloudWatch CPU utilization."
              />
            ) : cpuPointsCount === 0 ? (
              <EmptyState
                icon={<Activity size={22} />}
                title="No CPU metrics available"
                description="No CloudWatch metric datapoints were returned for the selected time range."
              />
            ) : (
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={cpuChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="overviewCpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0A8BFF" stopOpacity={0.18} />
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
                      domain={[0, 100]}
                      unit="%"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const val = payload[0].value;
                          return (
                            <div className="bg-surface/95 backdrop-blur-md px-3 py-2 rounded-xl border border-line shadow-card text-xs">
                              <p className="text-muted">{payload[0].payload.time}</p>
                              <p className="font-semibold text-brand-600 font-mono mt-0.5">
                                {val !== null ? `${val}%` : 'No data'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stroke="#0A8BFF"
                      strokeWidth={2}
                      connectNulls={false}
                      fillOpacity={1}
                      fill="url(#overviewCpuGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        {/* Cost by Service Card */}
        <Card className="lg:col-span-5 xl:col-span-5 flex flex-col">
          {/* Card Header & Month Selector */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-line">
            <div className="flex items-center gap-2">
              <PieChartIcon size={18} className="text-brand-500" />
              <div>
                <h2 className="text-base font-semibold text-ink">
                  Cost by Service
                </h2>
                <div
                  className="flex items-center gap-1 text-[11px] text-muted"
                  title="Month-to-date cost grouped by AWS service"
                >
                  <Info size={12} />
                  <span>Month-to-date cost grouped by service</span>
                </div>
              </div>
            </div>

            <div className="w-40">
              <Select
                id="costMonthSelect"
                aria-label="Select billing month"
                value={selectedMonthRange}
                onChange={(e) => setSelectedMonthRange(e.target.value)}
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Donut Content Area */}
          <div className="min-h-[280px] w-full flex flex-col items-center justify-center">
            {selectedCostsLoading ? (
              <div className="w-full space-y-3 py-6">
                <Skeleton height="200px" width="100%" />
              </div>
            ) : costsError ? (
              <div className="text-center py-10 space-y-3">
                <AlertCircle size={24} className="text-danger mx-auto" />
                <p className="text-xs text-danger">{costsError}</p>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => refetchSelectedCosts(true)}
                >
                  Retry
                </Button>
              </div>
            ) : donutData.length === 0 ? (
              <EmptyState
                icon={<DollarSign size={22} />}
                title="No cost data available"
                description="No cost data available. Your AWS account has no billing data for the selected period."
              />
            ) : (
              <div className="w-full flex flex-col items-center">
                {/* Donut Chart with Centered Total */}
                <div className="relative h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const item = payload[0];
                            return (
                              <div className="bg-surface/95 backdrop-blur-md px-3 py-2 rounded-xl border border-line shadow-card text-xs">
                                <p className="font-semibold text-ink">{item.name}</p>
                                <p className="text-body font-mono mt-0.5">
                                  ${Number(item.value).toFixed(2)} ({item.payload?.percentage})
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Total inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Total
                    </span>
                    <span className="text-base font-bold text-ink font-mono">
                      {costUnit === 'USD'
                        ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                          }).format(totalSelectedCost)
                        : `${totalSelectedCost.toFixed(0)} ${costUnit}`}
                    </span>
                  </div>
                </div>

                {/* Formatted Legend */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 border-t border-line mt-2 text-xs">
                  {donutData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-body truncate" title={item.name}>
                        {item.name}
                      </span>
                      <span className="text-muted font-mono ml-auto shrink-0">
                        ${item.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
