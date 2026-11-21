import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useConnections } from '../../context/ConnectionsContext';
import { useServiceCosts } from '../../hooks/useServiceCosts';
import { type CostExplorerResponse } from '../../services/awsApi';
import { exportCsv, type CsvColumn } from '../../utils/exportCsv';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Table, type TableColumn } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  DollarSign,
  TrendingUp,
  Layers,
  Calendar,
  Download,
  RefreshCw,
  Info,
  Cloud,
  Plus,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type PresetKey = 'this-month' | 'last-30' | 'last-3-months';

// Chart Color Palette from DESIGN.md
const CHART_COLORS = [
  '#0A8BFF', // chart-1
  '#22C3EE', // chart-2
  '#6C7BFF', // chart-3
  '#14B8A6', // chart-4
  '#94A3B8', // chart-5
  '#CBD5E1', // chart-other
];

function calculatePresetDates(preset: PresetKey) {
  const now = new Date();
  let start: Date;
  const end: Date = now;
  let dayCount: number;

  if (preset === 'this-month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    dayCount = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );
  } else if (preset === 'last-30') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    dayCount = 30;
  } else {
    // last-3-months: first day of calendar month 2 months before current month through today
    start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    dayCount = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );
  }

  const startIso = start.toISOString().split('T')[0];
  const endInclusiveIso = end.toISOString().split('T')[0];

  // Exclusive end date for AWS Cost Explorer (one day after end)
  const nextDay = new Date(end);
  nextDay.setDate(nextDay.getDate() + 1);
  const endExclusiveIso = nextDay.toISOString().split('T')[0];

  return {
    startDate: startIso,
    endDate: endExclusiveIso,
    displayRange: `${startIso} to ${endInclusiveIso}`,
    dayCount,
  };
}

interface ServiceSummaryRow extends Record<string, unknown> {
  service: string;
  amount: number;
  share: number;
  unit: string;
}

export default function CostPage() {
  const { connections, activeConnection } = useConnections();

  const connectedAccounts = useMemo(
    () => connections.filter((c) => c.status === 'CONNECTED'),
    [connections],
  );

  const selectedConnection = useMemo(() => {
    if (connectedAccounts.length === 0) return null;
    const match = connectedAccounts.find(
      (c) => c.connectionId === activeConnection?.connectionId,
    );
    return match || connectedAccounts[0];
  }, [connectedAccounts, activeConnection]);

  // Preset selector state
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>('this-month');
  const { startDate, endDate, dayCount } = useMemo(
    () => calculatePresetDates(selectedPreset),
    [selectedPreset],
  );

  const { costs, isLoading, error, refetch } = useServiceCosts(
    selectedConnection?.connectionId ?? null,
    startDate,
    endDate,
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // KPI Calculations
  const { totalSpend, topService, dailyAverage, distinctServicesCount, costUnit } =
    useMemo(() => {
      if (costs.length === 0) {
        return {
          totalSpend: 0,
          topService: null as { name: string; amount: number } | null,
          dailyAverage: 0,
          distinctServicesCount: 0,
          costUnit: 'USD',
        };
      }

      const unit = costs[0]?.unit || 'USD';
      let total = 0;
      const serviceMap = new Map<string, number>();

      costs.forEach((c) => {
        const val = c.amount || 0;
        total += val;
        serviceMap.set(c.service, (serviceMap.get(c.service) || 0) + val);
      });

      let top: { name: string; amount: number } | null = null;
      serviceMap.forEach((amt, name) => {
        if (!top || amt > top.amount) {
          top = { name, amount: amt };
        }
      });

      const avg = dayCount > 0 ? total / dayCount : 0;

      return {
        totalSpend: total,
        topService: top,
        dailyAverage: avg,
        distinctServicesCount: serviceMap.size,
        costUnit: unit,
      };
    }, [costs, dayCount]);

  // Format Currency
  const formatCurrency = useCallback(
    (amount: number) => {
      if (costUnit === 'USD') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      }
      return `${amount.toFixed(2)} ${costUnit}`;
    },
    [costUnit],
  );

  // Grouped Service Summary for Table
  const serviceSummaryRows: ServiceSummaryRow[] = useMemo(() => {
    if (costs.length === 0 || totalSpend === 0) return [];

    const map = new Map<string, number>();
    costs.forEach((c) => {
      map.set(c.service, (map.get(c.service) || 0) + (c.amount || 0));
    });

    return Array.from(map.entries())
      .map(([service, amount]) => ({
        service,
        amount,
        share: totalSpend > 0 ? (amount / totalSpend) * 100 : 0,
        unit: costUnit,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [costs, totalSpend, costUnit]);

  // Stacked Bar Chart Data
  const { stackedChartData, topServiceKeys } = useMemo(() => {
    if (costs.length === 0) {
      return { stackedChartData: [], topServiceKeys: [] };
    }

    // Identify top 5 services overall
    const serviceTotals = new Map<string, number>();
    costs.forEach((c) => {
      serviceTotals.set(c.service, (serviceTotals.get(c.service) || 0) + (c.amount || 0));
    });

    const sortedServices = Array.from(serviceTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    const top5 = sortedServices.slice(0, 5);
    const top5Set = new Set(top5);
    const hasOther = sortedServices.length > 5;

    // Group by date
    const dateMap = new Map<string, Record<string, number>>();

    costs.forEach((c) => {
      const dateKey = c.date;
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {});
      }
      const dayData = dateMap.get(dateKey)!;

      if (top5Set.has(c.service)) {
        dayData[c.service] = (dayData[c.service] || 0) + (c.amount || 0);
      } else {
        dayData['Other'] = (dayData['Other'] || 0) + (c.amount || 0);
      }
    });

    // Sort dates chronologically
    const sortedDates = Array.from(dateMap.keys()).sort();

    const chartPoints = sortedDates.map((dateKey) => {
      const entry: Record<string, string | number> = {
        date: dateKey,
        displayDate: new Date(dateKey + 'T00:00:00').toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
        }),
      };

      const dayRecord = dateMap.get(dateKey)!;
      top5.forEach((svc) => {
        entry[svc] = Number((dayRecord[svc] || 0).toFixed(2));
      });
      if (hasOther) {
        entry['Other'] = Number((dayRecord['Other'] || 0).toFixed(2));
      }

      return entry;
    });

    const keys = [...top5];
    if (hasOther) {
      keys.push('Other');
    }

    return { stackedChartData: chartPoints, topServiceKeys: keys };
  }, [costs]);

  // CSV Export
  const handleExportCsv = () => {
    const today = new Date().toISOString().split('T')[0];
    const filename = `cloudwise-cost-usage-${today}.csv`;

    const columns: CsvColumn<CostExplorerResponse>[] = [
      { header: 'Date', key: 'date' },
      { header: 'Service', key: 'service' },
      { header: 'Cost', key: (r) => r.amount },
      { header: 'Currency', key: 'unit' },
    ];

    exportCsv(filename, columns, costs);
  };

  // Service Table Columns
  const tableColumns: TableColumn<ServiceSummaryRow>[] = [
    {
      key: 'service',
      header: 'Service',
      render: (r) => <span className="font-semibold text-ink">{r.service}</span>,
    },
    {
      key: 'amount',
      header: 'Total Cost',
      align: 'right',
      render: (r) => (
        <span className="font-mono text-ink font-semibold">
          {formatCurrency(r.amount)}
        </span>
      ),
    },
    {
      key: 'share',
      header: 'Percentage Share',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center gap-2 justify-end w-full">
          <div className="w-20 h-1.5 rounded-full bg-line overflow-hidden hidden sm:block">
            <div
              className="h-full bg-brand-500 rounded-full"
              style={{ width: `${Math.min(r.share, 100)}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted w-12 text-right">
            {r.share.toFixed(1)}%
          </span>
        </div>
      ),
    },
  ];

  // NO CONNECTED ACCOUNTS STATE
  if (connectedAccounts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Card>
          <EmptyState
            icon={<Cloud size={28} />}
            title="No connected AWS account"
            description="Connect your AWS account using a cross-account IAM role to analyze cost and usage telemetry."
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
      {/* Page Header */}
      <PageHeader
        title="Cost & Usage"
        subtitle={`AWS spending grouped by service over the selected period for ${
          selectedConnection?.label || selectedConnection?.accountId
        }.`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Preset Selector */}
            <div className="w-44">
              <Select
                id="costPreset"
                aria-label="Select cost time period"
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value as PresetKey)}
              >
                <option value="this-month">This month</option>
                <option value="last-30">Last 30 days</option>
                <option value="last-3-months">Last 3 months</option>
              </Select>
            </div>

            {/* Refresh Button */}
            <Button
              variant="secondary"
              size="md"
              aria-label="Refresh cost data"
              disabled={isLoading || isRefreshing}
              onClick={handleRefresh}
              leftIcon={
                <RefreshCw
                  size={15}
                  className={isRefreshing ? 'animate-spin text-brand-600' : ''}
                />
              }
            >
              Refresh
            </Button>

            {/* Export CSV */}
            <Button
              variant="secondary"
              size="md"
              disabled={costs.length === 0}
              onClick={handleExportCsv}
              leftIcon={<Download size={15} />}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* KPI Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Spend */}
        <StatCard
          label="Total Spend"
          value={isLoading ? null : formatCurrency(totalSpend)}
          isLoading={isLoading}
          icon={<DollarSign size={18} className="text-brand-500" />}
          subtitle={
            costs.length === 0 && !isLoading ? 'No billing data' : 'Across all services'
          }
          className="border-brand-500/60 shadow-[0_4px_20px_-4px_rgba(10,139,255,0.12)]"
        />

        {/* KPI 2: Top Service */}
        <StatCard
          label="Top Service"
          value={
            isLoading
              ? null
              : topService
              ? formatCurrency(topService.amount)
              : '—'
          }
          isLoading={isLoading}
          icon={<TrendingUp size={18} className="text-brand-500" />}
          subtitle={topService ? topService.name : 'No service data'}
        />

        {/* KPI 3: Daily Average */}
        <StatCard
          label="Daily Average"
          value={isLoading ? null : formatCurrency(dailyAverage)}
          isLoading={isLoading}
          icon={<Calendar size={18} className="text-brand-500" />}
          subtitle={`Over ${dayCount} calendar days`}
        />

        {/* KPI 4: Number of Services */}
        <StatCard
          label="Active Services"
          value={isLoading ? null : distinctServicesCount}
          isLoading={isLoading}
          icon={<Layers size={18} className="text-brand-500" />}
          subtitle="Distinct billing categories"
        />
      </div>

      {/* Error state */}
      {error && (
        <Card className="p-4 flex items-center justify-between bg-danger-bg/40 border-danger/30">
          <div className="flex items-center gap-2 text-xs text-danger font-medium">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="md" onClick={() => refetch(true)}>
            Retry
          </Button>
        </Card>
      )}

      {/* Stacked Daily Cost Chart */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-line">
          <div>
            <h2 className="text-base font-semibold text-ink">
              Daily Cost by Service
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Daily breakdown of top AWS services across the selected period.
            </p>
          </div>
        </div>

        <div className="min-h-[300px] w-full flex items-center justify-center">
          {isLoading ? (
            <div className="w-full space-y-3 py-6">
              <Skeleton height="240px" width="100%" />
            </div>
          ) : costs.length === 0 ? (
            <EmptyState
              icon={<DollarSign size={24} />}
              title="No cost data available"
              description="Your AWS account has no billing data for the selected period."
            />
          ) : (
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stackedChartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const total = payload.reduce(
                          (sum, entry) => sum + (Number(entry.value) || 0),
                          0,
                        );
                        return (
                          <div className="bg-surface/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-line shadow-card text-xs min-w-44">
                            <p className="font-semibold text-ink mb-1">{label}</p>
                            <div className="space-y-1 mb-2 border-b border-line/60 pb-1.5">
                              {payload.map((entry) => (
                                <div key={entry.name} className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span
                                      className="w-2 h-2 rounded-full shrink-0"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-body truncate">{entry.name}</span>
                                  </div>
                                  <span className="font-mono text-ink shrink-0 font-medium">
                                    ${Number(entry.value).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between font-semibold text-ink pt-0.5">
                              <span>Total:</span>
                              <span className="font-mono">${total.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  {topServiceKeys.map((svcKey, idx) => (
                    <Bar
                      key={svcKey}
                      dataKey={svcKey}
                      name={svcKey}
                      stackId="costs"
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      radius={idx === topServiceKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>

      {/* Service Breakdown Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">
            Service Breakdown
          </h2>
          <span className="text-xs text-muted">
            {serviceSummaryRows.length} services
          </span>
        </div>

        <Table
          columns={tableColumns}
          data={serviceSummaryRows}
          keyExtractor={(r) => r.service}
          isLoading={isLoading}
          emptyTitle="No service breakdown"
          emptyDescription="No service cost records were found for this time range."
        />
      </div>

      {/* Cost Data Lag Note */}
      <div className="flex items-center gap-2 p-3.5 rounded-xl bg-app border border-line text-xs text-muted">
        <Info size={15} className="text-brand-500 shrink-0" />
        <span>Cost Explorer data can lag by up to a day.</span>
      </div>
    </div>
  );
}
