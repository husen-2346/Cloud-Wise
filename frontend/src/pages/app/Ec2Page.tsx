import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useConnections } from '../../context/ConnectionsContext';
import { useEc2Instances } from '../../hooks/useEc2Instances';
import { type Ec2InstanceResponse } from '../../services/awsApi';
import { exportCsv, type CsvColumn } from '../../utils/exportCsv';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Badge, type BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Ec2DetailDrawer } from './components/Ec2DetailDrawer';
import {
  Server,
  Download,
  Search,
  Copy,
  Check,
  Cloud,
  Plus,
} from 'lucide-react';

// Relative time helper with tooltip
function formatRelativeTime(dateIso: string): { relative: string; absolute: string } {
  if (!dateIso) return { relative: '—', absolute: '—' };
  const d = new Date(dateIso);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  const absolute = d.toLocaleString();

  if (diffSec < 60) return { relative: 'Just now', absolute };
  if (diffSec < 3600) return { relative: `${Math.floor(diffSec / 60)}m ago`, absolute };
  if (diffSec < 86400) return { relative: `${Math.floor(diffSec / 3600)}h ago`, absolute };
  const days = Math.floor(diffSec / 86400);
  if (days < 30) return { relative: `${days}d ago`, absolute };
  return { relative: d.toLocaleDateString(), absolute };
}

// IP numerical comparator
function compareIps(a: string | null, b: string | null): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const numA = a.split('.').map(Number);
  const numB = b.split('.').map(Number);
  for (let i = 0; i < 4; i++) {
    if ((numA[i] || 0) !== (numB[i] || 0)) {
      return (numA[i] || 0) - (numB[i] || 0);
    }
  }
  return 0;
}

export default function Ec2Page() {
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

  const { instances, isLoading, error, refetch } = useEc2Instances(
    selectedConnection?.connectionId ?? null,
  );

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');

  // Sorting state
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Drawer state
  const [selectedInstance, setSelectedInstance] = useState<Ec2InstanceResponse | null>(null);

  // Copied instance ID state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Distinct states for dropdown filter
  const distinctStates = useMemo(() => {
    const states = new Set<string>();
    instances.forEach((inst) => {
      if (inst.state) states.add(inst.state.toLowerCase());
    });
    return Array.from(states);
  }, [instances]);

  // Summary counts
  const totalCount = instances.length;
  const runningCount = useMemo(
    () => instances.filter((i) => i.state.toLowerCase() === 'running').length,
    [instances],
  );
  const stoppedCount = useMemo(
    () => instances.filter((i) => i.state.toLowerCase() === 'stopped').length,
    [instances],
  );

  // Filtered & Sorted instances
  const filteredAndSortedInstances = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = instances.filter((inst) => {
      // State filter
      if (stateFilter !== 'ALL' && inst.state.toLowerCase() !== stateFilter) {
        return false;
      }

      // Search match
      if (!term) return true;

      const nameMatch = (inst.name || '').toLowerCase().includes(term);
      const idMatch = inst.instanceId.toLowerCase().includes(term);
      const typeMatch = inst.instanceType.toLowerCase().includes(term);
      const publicIpMatch = (inst.publicIpAddress || '').includes(term);
      const privateIpMatch = (inst.privateIpAddress || '').includes(term);

      return nameMatch || idMatch || typeMatch || publicIpMatch || privateIpMatch;
    });

    // Sort
    return [...filtered].sort((a, b) => {
      let cmp: number;
      switch (sortKey) {
        case 'name':
          cmp = (a.name || 'zzz').localeCompare(b.name || 'zzz');
          break;
        case 'instanceId':
          cmp = a.instanceId.localeCompare(b.instanceId);
          break;
        case 'state':
          cmp = a.state.localeCompare(b.state);
          break;
        case 'instanceType':
          cmp = a.instanceType.localeCompare(b.instanceType);
          break;
        case 'availabilityZone':
          cmp = a.availabilityZone.localeCompare(b.availabilityZone);
          break;
        case 'publicIpAddress':
          cmp = compareIps(a.publicIpAddress, b.publicIpAddress);
          break;
        case 'privateIpAddress':
          cmp = compareIps(a.privateIpAddress, b.privateIpAddress);
          break;
        case 'launchTime': {
          const tA = a.launchTime ? new Date(a.launchTime).getTime() : 0;
          const tB = b.launchTime ? new Date(b.launchTime).getTime() : 0;
          cmp = tA - tB;
          break;
        }
        default:
          cmp = 0;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [instances, searchTerm, stateFilter, sortKey, sortDirection]);

  // Handle Header Sorting
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const today = new Date().toISOString().split('T')[0];
    const filename = `cloudwise-ec2-instances-${today}.csv`;

    const columns: CsvColumn<Ec2InstanceResponse>[] = [
      { header: 'Name', key: (r) => r.name || 'Unnamed' },
      { header: 'Instance ID', key: 'instanceId' },
      { header: 'State', key: 'state' },
      { header: 'Type', key: 'instanceType' },
      { header: 'Availability Zone', key: 'availabilityZone' },
      { header: 'Public IP', key: (r) => r.publicIpAddress || '' },
      { header: 'Private IP', key: (r) => r.privateIpAddress || '' },
      { header: 'Launch Time', key: (r) => (r.launchTime ? new Date(r.launchTime).toISOString() : '') },
    ];

    exportCsv(filename, columns, filteredAndSortedInstances);
  };

  // Table Columns Definition
  const columns: TableColumn<Ec2InstanceResponse>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (r) => (
        <span className="font-semibold text-ink">
          {r.name || <span className="text-muted italic">Unnamed</span>}
        </span>
      ),
    },
    {
      key: 'instanceId',
      header: 'Instance ID',
      sortable: true,
      render: (r) => (
        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
          <span>{r.instanceId}</span>
          <button
            type="button"
            aria-label="Copy instance ID"
            onClick={(e) => handleCopy(r.instanceId, e)}
            className="text-brand-600 hover:text-brand-500 transition-colors p-0.5"
          >
            {copiedId === r.instanceId ? (
              <Check size={13} className="text-success" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>
      ),
    },
    {
      key: 'state',
      header: 'State',
      sortable: true,
      render: (r) => {
        const variant: BadgeVariant =
          r.state.toLowerCase() === 'running'
            ? 'running'
            : r.state.toLowerCase() === 'stopped'
            ? 'stopped'
            : 'pending';
        return <Badge variant={variant}>{r.state}</Badge>;
      },
    },
    {
      key: 'instanceType',
      header: 'Type',
      sortable: true,
      render: (r) => <span className="font-mono text-xs">{r.instanceType}</span>,
    },
    {
      key: 'availabilityZone',
      header: 'AZ',
      sortable: true,
      render: (r) => <span className="text-xs">{r.availabilityZone}</span>,
    },
    {
      key: 'publicIpAddress',
      header: 'Public IP',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs">{r.publicIpAddress || '—'}</span>
      ),
    },
    {
      key: 'privateIpAddress',
      header: 'Private IP',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs">{r.privateIpAddress || '—'}</span>
      ),
    },
    {
      key: 'launchTime',
      header: 'Launched',
      sortable: true,
      render: (r) => {
        const { relative, absolute } = formatRelativeTime(r.launchTime);
        return (
          <span title={absolute} className="text-xs text-muted cursor-help">
            {relative}
          </span>
        );
      },
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
            description="Connect your AWS account using a cross-account IAM role to discover and monitor EC2 instances."
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
        title="EC2 Instances"
        subtitle={`Virtual compute instances discovered in ${
          selectedConnection?.label || selectedConnection?.accountId
        }. Click any row to inspect telemetry.`}
        actions={
          <Button
            variant="secondary"
            size="md"
            disabled={filteredAndSortedInstances.length === 0}
            onClick={handleExportCsv}
            leftIcon={<Download size={15} />}
          >
            Export CSV
          </Button>
        }
      />

      {/* Summary Strip (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Instances"
          value={totalCount}
          isLoading={isLoading}
          icon={<Server size={18} className="text-brand-500" />}
          subtitle="All discovered instances"
        />
        <StatCard
          label="Running"
          value={runningCount}
          isLoading={isLoading}
          change="Active compute"
          changeType="positive"
          subtitle="In-service workloads"
        />
        <StatCard
          label="Stopped"
          value={stoppedCount}
          isLoading={isLoading}
          subtitle="Zero compute cost"
        />
      </div>

      {/* Search and Filters Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-line shadow-card">
        <div className="w-full sm:w-80">
          <Input
            id="ec2Search"
            name="ec2Search"
            type="search"
            placeholder="Search by name, ID, type, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        <div className="w-full sm:w-52">
          <Select
            id="stateFilter"
            aria-label="Filter by instance state"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="ALL">All states ({totalCount})</option>
            {distinctStates.map((st) => (
              <option key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1)} (
                {instances.filter((i) => i.state.toLowerCase() === st).length})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="p-4 flex items-center justify-between bg-danger-bg/40 border-danger/30">
          <span className="text-xs text-danger font-medium">{error}</span>
          <Button variant="secondary" size="md" onClick={refetch}>
            Retry
          </Button>
        </Card>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={filteredAndSortedInstances}
        keyExtractor={(r) => r.instanceId}
        isLoading={isLoading}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(r) => setSelectedInstance(r)}
        emptyTitle="No EC2 instances found"
        emptyDescription={
          searchTerm || stateFilter !== 'ALL'
            ? 'No instances matched your current search or state filter.'
            : 'No EC2 instances were discovered in this AWS account.'
        }
      />

      {/* Instance Detail Drawer */}
      {selectedInstance && (
        <Ec2DetailDrawer
          instance={selectedInstance}
          connectionId={selectedConnection!.connectionId}
          onClose={() => setSelectedInstance(null)}
        />
      )}
    </div>
  );
}
