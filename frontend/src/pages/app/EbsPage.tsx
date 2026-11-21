import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useConnections } from '../../context/ConnectionsContext';
import { useEbsVolumes } from '../../hooks/useEbsVolumes';
import { type EbsVolumeResponse } from '../../services/awsApi';
import { exportCsv, type CsvColumn } from '../../utils/exportCsv';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Table, type TableColumn } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  HardDrive,
  Download,
  Search,
  Copy,
  Check,
  Lock,
  Cloud,
  Plus,
} from 'lucide-react';

export default function EbsPage() {
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

  const { volumes, isLoading, error, refetch } = useEbsVolumes(
    selectedConnection?.connectionId ?? null,
  );

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Sorting state
  const [sortKey, setSortKey] = useState<string>('volumeId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Copied volume ID state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Distinct states and types for filter dropdowns
  const distinctStates = useMemo(() => {
    const states = new Set<string>();
    volumes.forEach((vol) => {
      if (vol.state) states.add(vol.state.toLowerCase());
    });
    return Array.from(states);
  }, [volumes]);

  const distinctTypes = useMemo(() => {
    const types = new Set<string>();
    volumes.forEach((vol) => {
      if (vol.volumeType) types.add(vol.volumeType);
    });
    return Array.from(types);
  }, [volumes]);

  // Summary counts
  const totalVolumes = volumes.length;
  const totalCapacityGiB = useMemo(
    () => volumes.reduce((sum, v) => sum + (v.sizeGiB || 0), 0),
    [volumes],
  );
  const unattachedVolumesCount = useMemo(
    () =>
      volumes.filter(
        (v) =>
          (!v.attachedInstanceIds || v.attachedInstanceIds.length === 0) &&
          v.state.toLowerCase() !== 'in-use',
      ).length,
    [volumes],
  );

  // Filtered & Sorted volumes
  const filteredAndSortedVolumes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = volumes.filter((vol) => {
      // State filter
      if (stateFilter !== 'ALL' && vol.state.toLowerCase() !== stateFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'ALL' && vol.volumeType !== typeFilter) {
        return false;
      }

      // Search match
      if (!term) return true;

      const idMatch = vol.volumeId.toLowerCase().includes(term);
      const azMatch = vol.availabilityZone.toLowerCase().includes(term);
      const typeMatch = vol.volumeType.toLowerCase().includes(term);
      const attachedMatch = (vol.attachedInstanceIds || []).some((instId) =>
        instId.toLowerCase().includes(term),
      );

      return idMatch || azMatch || typeMatch || attachedMatch;
    });

    // Sort
    return [...filtered].sort((a, b) => {
      let cmp: number;
      switch (sortKey) {
        case 'volumeId':
          cmp = a.volumeId.localeCompare(b.volumeId);
          break;
        case 'sizeGiB':
          cmp = (a.sizeGiB || 0) - (b.sizeGiB || 0);
          break;
        case 'volumeType':
          cmp = a.volumeType.localeCompare(b.volumeType);
          break;
        case 'state':
          cmp = a.state.localeCompare(b.state);
          break;
        case 'availabilityZone':
          cmp = a.availabilityZone.localeCompare(b.availabilityZone);
          break;
        case 'createTime': {
          const tA = a.createTime ? new Date(a.createTime).getTime() : 0;
          const tB = b.createTime ? new Date(b.createTime).getTime() : 0;
          cmp = tA - tB;
          break;
        }
        default:
          cmp = 0;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [volumes, searchTerm, stateFilter, typeFilter, sortKey, sortDirection]);

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
    const filename = `cloudwise-ebs-volumes-${today}.csv`;

    const columns: CsvColumn<EbsVolumeResponse>[] = [
      { header: 'Volume ID', key: 'volumeId' },
      { header: 'Size (GiB)', key: (r) => r.sizeGiB },
      { header: 'Type', key: 'volumeType' },
      { header: 'State', key: 'state' },
      { header: 'Availability Zone', key: 'availabilityZone' },
      {
        header: 'Attached To',
        key: (r) => (r.attachedInstanceIds && r.attachedInstanceIds.length > 0 ? r.attachedInstanceIds.join('; ') : 'None'),
      },
      { header: 'Encrypted', key: (r) => (r.encrypted ? 'Yes' : 'No') },
      { header: 'Created', key: (r) => (r.createTime ? new Date(r.createTime).toISOString() : '') },
    ];

    exportCsv(filename, columns, filteredAndSortedVolumes);
  };

  // Table Columns Definition
  const columns: TableColumn<EbsVolumeResponse>[] = [
    {
      key: 'volumeId',
      header: 'Volume ID',
      sortable: true,
      render: (r) => (
        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-ink font-semibold">
          <span>{r.volumeId}</span>
          <button
            type="button"
            aria-label="Copy volume ID"
            onClick={(e) => handleCopy(r.volumeId, e)}
            className="text-brand-600 hover:text-brand-500 transition-colors p-0.5"
          >
            {copiedId === r.volumeId ? (
              <Check size={13} className="text-success" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>
      ),
    },
    {
      key: 'sizeGiB',
      header: 'Size',
      sortable: true,
      align: 'right',
      render: (r) => <span className="font-mono text-xs">{r.sizeGiB} GiB</span>,
    },
    {
      key: 'volumeType',
      header: 'Type',
      sortable: true,
      render: (r) => <span className="font-mono text-xs">{r.volumeType}</span>,
    },
    {
      key: 'state',
      header: 'State',
      sortable: true,
      render: (r) => {
        const isAttached =
          (r.attachedInstanceIds && r.attachedInstanceIds.length > 0) ||
          r.state.toLowerCase() === 'in-use';

        if (isAttached) {
          return <Badge variant="in-use">{r.state}</Badge>;
        }
        return <Badge variant="unattached">Unattached</Badge>;
      },
    },
    {
      key: 'availabilityZone',
      header: 'AZ',
      sortable: true,
      render: (r) => <span className="text-xs">{r.availabilityZone}</span>,
    },
    {
      key: 'attachedInstanceIds',
      header: 'Attached to',
      render: (r) => {
        if (!r.attachedInstanceIds || r.attachedInstanceIds.length === 0) {
          return <span className="text-xs text-muted">None</span>;
        }
        return (
          <div className="flex flex-col gap-0.5">
            {r.attachedInstanceIds.map((instId) => (
              <span key={instId} className="font-mono text-xs text-brand-600">
                {instId}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'encrypted',
      header: 'Encrypted',
      align: 'center',
      render: (r) =>
        r.encrypted ? (
          <div className="inline-flex items-center gap-1 text-xs text-success font-medium">
            <Lock size={12} />
            <span>Yes</span>
          </div>
        ) : (
          <span className="text-xs text-muted">No</span>
        ),
    },
    {
      key: 'createTime',
      header: 'Created',
      sortable: true,
      render: (r) => (
        <span className="text-xs text-muted">
          {r.createTime ? new Date(r.createTime).toLocaleDateString() : '—'}
        </span>
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
            description="Connect your AWS account using a cross-account IAM role to discover and monitor EBS volumes."
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
        title="EBS Volumes"
        subtitle={`Elastic block store storage volumes discovered in ${
          selectedConnection?.label || selectedConnection?.accountId
        }.`}
        actions={
          <Button
            variant="secondary"
            size="md"
            disabled={filteredAndSortedVolumes.length === 0}
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
          label="Total Volumes"
          value={totalVolumes}
          isLoading={isLoading}
          icon={<HardDrive size={18} className="text-brand-500" />}
          subtitle="Provisioned storage blocks"
        />
        <StatCard
          label="Total Storage"
          value={`${totalCapacityGiB.toLocaleString()} GiB`}
          isLoading={isLoading}
          subtitle="Aggregate provisioned size"
        />
        <StatCard
          label="Unattached Volumes"
          value={unattachedVolumesCount}
          isLoading={isLoading}
          change={unattachedVolumesCount > 0 ? 'Potential waste' : 'All attached'}
          changeType={unattachedVolumesCount > 0 ? 'negative' : 'positive'}
          subtitle="Idle block storage"
        />
      </div>

      {/* Unattached Volume Warning Alert */}
      {unattachedVolumesCount > 0 && (
        <Alert variant="warning">
          Unattached volumes may still incur storage cost. Verify that a volume is not needed before deleting it.
        </Alert>
      )}

      {/* Search and Filters Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-line shadow-card">
        <div className="w-full sm:w-80">
          <Input
            id="ebsSearch"
            name="ebsSearch"
            type="search"
            placeholder="Search by volume ID, instance, AZ, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
          {/* State Filter */}
          <div className="w-full sm:w-44">
            <Select
              id="ebsStateFilter"
              aria-label="Filter by volume state"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="ALL">All states ({totalVolumes})</option>
              {distinctStates.map((st) => (
                <option key={st} value={st}>
                  {st.charAt(0).toUpperCase() + st.slice(1)} (
                  {volumes.filter((v) => v.state.toLowerCase() === st).length})
                </option>
              ))}
            </Select>
          </div>

          {/* Volume Type Filter */}
          <div className="w-full sm:w-36">
            <Select
              id="ebsTypeFilter"
              aria-label="Filter by volume type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All types</option>
              {distinctTypes.map((tp) => (
                <option key={tp} value={tp}>
                  {tp} ({volumes.filter((v) => v.volumeType === tp).length})
                </option>
              ))}
            </Select>
          </div>
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
        data={filteredAndSortedVolumes}
        keyExtractor={(r) => r.volumeId}
        isLoading={isLoading}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyTitle="No EBS volumes found"
        emptyDescription={
          searchTerm || stateFilter !== 'ALL' || typeFilter !== 'ALL'
            ? 'No volumes matched your current search or filters.'
            : 'No EBS volumes were discovered in this AWS account.'
        }
      />
    </div>
  );
}
