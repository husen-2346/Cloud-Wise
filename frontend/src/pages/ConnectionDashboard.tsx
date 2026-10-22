import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { authenticatedFetch } from '../services/authApi';
import {
  House,
  ChartNoAxesCombined,
  ClipboardList,
  Settings,
  ChevronDown,
  Cloud,
  CircleUserRound,
  Menu,
  X,
  Search,
  Download,
  ArrowLeft,
  Check,
  Circle,
  LoaderCircle,
  AlertTriangle,
  ShieldAlert,
  Server,
  HardDrive,
  Sparkles,
  RefreshCw,
  ChevronRight,
  LogOut,
} from 'lucide-react';

import {
  fetchEc2Instances,
  fetchEbsVolumes,
} from '../services/awsApi';

import type {
  Ec2Instance,
  EbsVolume,
} from '../services/awsApi';

interface ConnectionDashboardProps {
  userName: string;
  token: string;
  onLogout?: () => void;
}

type Page = 'Home' | 'Analysis' | 'History' | 'Settings';
type ProviderId = 'aws' | 'azure' | 'gcp';
type Severity = 'High' | 'Medium' | 'Low';
type Finding = {
  id: string;
  title: string;
  resourceId: string;
  severity: Severity;
  savings: number;
  description: string;
  recommendation: string;
  icon: 'server' | 'storage' | 'shield';
};
type AnalysisRecord = {
  id: string;
  name: string;
  provider: ProviderId;
  region: string;
  date: string;
  resources: number;
  issues: number;
  savings: number;
  status: 'Completed' | 'In Progress';
  findings: Finding[];
};

const providers: { id: ProviderId; name: string; description: string; logo: string }[] = [
  {
    id: 'aws',
    name: 'AWS Account',
    description: 'Analyze EC2, EBS, S3 and other AWS resources.',
    logo: '/logos/aws.png',
  },
  {
    id: 'azure',
    name: 'Azure Account',
    description: 'Azure resource analysis will be available in a future integration.',
    logo: '/logos/azure.png',
  },
  {
    id: 'gcp',
    name: 'Google Cloud Account',
    description: 'Google Cloud analysis will be available in a future integration.',
    logo: '/logos/gcp.png',
  },
];
const regions = [
  { value: 'ap-south-1', label: 'ap-south-1 (Mumbai)' },
  { value: 'us-east-1', label: 'us-east-1 (N. Virginia)' },
  { value: 'us-west-2', label: 'us-west-2 (Oregon)' },
  { value: 'eu-west-1', label: 'eu-west-1 (Ireland)' },
  { value: 'ap-southeast-1', label: 'ap-southeast-1 (Singapore)' },
];
const sampleFindings: Finding[] = [
  {
    id: 'f1',
    title: 'Over-provisioned EC2 instance',
    resourceId: 'i-0a1b2c3d4e5f67890',
    severity: 'High',
    savings: 120,
    description: 'Instance has averaged only 5% CPU utilization over the last 14 days.',
    recommendation:
      'Review workload requirements and consider a smaller instance family. Validate memory and network utilization before resizing.',
    icon: 'server',
  },
  {
    id: 'f2',
    title: 'Unused EBS volume',
    resourceId: 'vol-0f1e2d3c4b5a6978',
    severity: 'Medium',
    savings: 45,
    description: 'This storage volume is not attached to an EC2 instance.',
    recommendation:
      'Confirm the volume is not needed for recovery. Create a snapshot if required, then delete the unattached volume.',
    icon: 'storage',
  },
  {
    id: 'f3',
    title: 'S3 bucket encryption review',
    resourceId: 'my-app-logs',
    severity: 'Low',
    savings: 15,
    description: 'Default server-side encryption configuration should be verified for this bucket.',
    recommendation:
      'Enable default encryption and review bucket policies. This is a security recommendation; savings are an illustrative estimate.',
    icon: 'shield',
  },
];
const initialRecords: AnalysisRecord[] = [
  {
    id: 'a1',
    name: 'Production Environment',
    provider: 'aws',
    region: 'ap-south-1',
    date: 'Oct 19, 2026 · 10:32 AM',
    resources: 24,
    issues: 3,
    savings: 180,
    status: 'Completed',
    findings: sampleFindings,
  },
  {
    id: 'a2',
    name: 'Dev Environment',
    provider: 'azure',
    region: 'eastus',
    date: 'Oct 16, 2026 · 2:18 PM',
    resources: 18,
    issues: 5,
    savings: 120,
    status: 'Completed',
    findings: sampleFindings.slice(0, 2),
  },
  {
    id: 'a3',
    name: 'Staging',
    provider: 'gcp',
    region: 'us-central1',
    date: 'Oct 12, 2026 · 11:05 AM',
    resources: 31,
    issues: 8,
    savings: 210,
    status: 'Completed',
    findings: sampleFindings,
  },
  {
    id: 'a4',
    name: 'Marketing',
    provider: 'aws',
    region: 'ap-south-1',
    date: 'Oct 08, 2026 · 4:40 PM',
    resources: 12,
    issues: 2,
    savings: 60,
    status: 'Completed',
    findings: sampleFindings.slice(1),
  },
  {
    id: 'a5',
    name: 'Research Project',
    provider: 'azure',
    region: 'eastus',
    date: 'Oct 02, 2026 · 9:20 AM',
    resources: 16,
    issues: 6,
    savings: 90,
    status: 'Completed',
    findings: sampleFindings,
  },
];
const money = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
const providerName = (id: ProviderId) =>
  providers.find((p) => p.id === id)?.name.replace(' Account', '') ?? 'Cloud';

function ProviderMark({ id, className = 'h-9 w-12' }: { id: ProviderId; className?: string }) {
  return (
    <img
      src={providers.find((p) => p.id === id)?.logo}
      alt={providerName(id)}
      className={`${className} object-contain`}
      onError={(event) => {
        event.currentTarget.style.display = 'none';
        const next = event.currentTarget.nextElementSibling as HTMLElement | null;
        if (next) next.style.display = 'flex';
      }}
    />
  );
}
function SeverityPill({ severity }: { severity: Severity }) {
  const styles =
    severity === 'High'
      ? 'bg-red-500/15 text-red-300'
      : severity === 'Medium'
        ? 'bg-amber-500/15 text-amber-300'
        : 'bg-emerald-500/15 text-emerald-300';
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}>
      {severity}
    </span>
  );
}

export default function ConnectionDashboard({ userName, token, onLogout }: ConnectionDashboardProps) {
  const [activeNav, setActiveNav] = useState<Page>('Home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('aws');
  const [region, setRegion] = useState('ap-south-1');
  const [records, setRecords] = useState(initialRecords);
  const [selectedRecordId, setSelectedRecordId] = useState(initialRecords[0].id);
  const [search, setSearch] = useState('');
  const [expandedFinding, setExpandedFinding] = useState<string | null>('f1');
  const [reportTab, setReportTab] = useState<'Issues' | 'Summary'>('Issues');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [notice, setNotice] = useState('');
  const [connected] = useState<ProviderId[]>([]);

  const [ec2Instances, setEc2Instances] = useState<Ec2Instance[]>([]);
  const [ebsVolumes, setEbsVolumes] = useState<EbsVolume[]>([]);
  const [isLoadingAws, setIsLoadingAws] = useState(false);
  const [awsError, setAwsError] = useState('');
  const [awsLoaded, setAwsLoaded] = useState(false);


  useEffect(() => {
    authenticatedFetch('/api/auth/me', token)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to verify the session.');
        }

        const user = await response.json();
        console.log('Authenticated backend user:', user.email);
      })
      .catch((error) => {
        console.error('Backend authentication check failed:', error);
      });
  }, [token]);

  //AWS 
  useEffect(() => {
    let cancelled = false;

    async function loadAwsResources() {
      setIsLoadingAws(true);
      setAwsError('');
      setAwsLoaded(false);

      try {
        const [instances, volumes] = await Promise.all([
          fetchEc2Instances(token),
          fetchEbsVolumes(token),
        ]);

        if (cancelled) return;

        setEc2Instances(instances);
        setEbsVolumes(volumes);
        setAwsLoaded(true);
      } catch (error) {
        if (cancelled) return;

        setAwsError(
          error instanceof Error
            ? error.message
            : 'Failed to load AWS resources.',
        );
      } finally {
        if (!cancelled) {
          setIsLoadingAws(false);
        }
      }
    }

    loadAwsResources();

    return () => {
      cancelled = true;
    };
  }, [token]);


  const selectedRecord = records.find((record) => record.id === selectedRecordId) ?? records[0];
  const filteredRecords = useMemo(
    () =>
      records.filter((record) =>
        `${record.name} ${providerName(record.provider)} ${record.region}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [records, search],
  );

  function navigate(page: Page) {
    setActiveNav(page);
    setMenuOpen(false);
    setNotice('');
  }

  async function startAnalysis() {
    if (selectedProvider !== 'aws') {
      setNotice(
        'Only AWS integration is currently implemented. Select AWS to continue.',
      );
      return;
    }

    if (isRunning) return;

    setIsRunning(true);
    setProgress(10);
    setStage(1);
    setNotice('');

    try {
      // Refresh the real AWS inventory before analyzing it.
      const [instances, volumes] = await Promise.all([
        fetchEc2Instances(token),
        fetchEbsVolumes(token),
      ]);

      setEc2Instances(instances);
      setEbsVolumes(volumes);
      setAwsLoaded(true);

      setProgress(45);
      setStage(2);

      // Flag EBS volumes that AWS reports as available (unattached).
      const findings: Finding[] = volumes
        .filter((volume) => volume.state.toLowerCase() === 'available')
        .map((volume, index) => ({
          id: `ebs-${volume.volumeId}-${index}`,
          title: 'Unattached EBS volume',
          resourceId: volume.volumeId,
          severity: 'Medium',
          savings: 0,
          description: `This ${volume.sizeGiB} GiB ${volume.volumeType} volume is currently available and does not appear to be attached to an EC2 instance.`,
          recommendation:
            'Verify that the volume is not needed for recovery or future use. Check for required snapshots before considering deletion.',
          icon: 'storage',
        }));

      setProgress(75);
      setStage(4);

      const next: AnalysisRecord = {
        id: `aws-${Date.now()}`,
        name: 'AWS Resource Analysis',
        provider: 'aws',
        region,
        date: `Scanned ${new Date().toLocaleString()}`,
        resources: instances.length + volumes.length,
        issues: findings.length,
        savings: 0,
        status: 'Completed',
        findings,
      };

      setRecords((previous) => [next, ...previous]);
      setSelectedRecordId(next.id);
      setReportTab('Issues');
      setExpandedFinding(findings[0]?.id ?? null);
      setProgress(100);
      setStage(5);
      setActiveNav('History');

      setNotice(
        `AWS inventory analysis completed: ${instances.length} EC2 instances and ${volumes.length} EBS volumes checked. No savings estimate has been calculated.`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to analyze AWS resources.';

      setAwsError(message);
      setAwsLoaded(false);
      setNotice(`AWS analysis failed: ${message}`);
    } finally {
      setIsRunning(false);
    }
  }

  function exportReport() {
    const report = selectedRecord;
    const rows = [
      ['Finding', 'Resource', 'Severity', 'Estimated monthly savings', 'Description'],
      ...report.findings.map((f) => [
        f.title,
        f.resourceId,
        f.severity,
        money(f.savings),
        f.description,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `cloudwise-${report.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#0b1116] text-[#e8eef0]">
      <div className="flex min-h-screen">
        {menuOpen && (
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col border-r border-white/[0.07] bg-[#0d151b] transition-transform duration-200 lg:static lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex h-[68px] shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5">
            <img src="/logo-icon.svg" alt="CloudWise" className="h-8 w-8 object-contain" />
            <span className="text-[21px] font-semibold tracking-tight">
              Cloud<span className="text-[#a7f3d0]">Wise</span>
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="ml-auto rounded-md p-1 text-[#9aa8b4] hover:bg-white/5 lg:hidden"
              aria-label="Close navigation"
            >
              <X size={19} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {[
              { label: 'Home' as Page, icon: House },
              { label: 'Analysis' as Page, icon: ChartNoAxesCombined },
              { label: 'History' as Page, icon: ClipboardList },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(label)}
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left text-sm transition ${activeNav === label ? 'bg-[#193029] font-medium text-[#d9fbe8]' : 'text-[#a5b1bb] hover:bg-white/[0.04] hover:text-white'}`}
              >
                <Icon size={19} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </nav>
          <div className="p-2 pb-4">
            <button
              type="button"
              onClick={() => navigate('Settings')}
              className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-sm transition ${activeNav === 'Settings' ? 'bg-[#193029] text-[#d9fbe8]' : 'text-[#a5b1bb] hover:bg-white/[0.04] hover:text-white'}`}
            >
              <Settings size={19} strokeWidth={1.8} />
              Settings
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="relative z-10 flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#10191f] px-4 sm:px-7">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-[#b5c1ca] hover:bg-white/5 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div className="hidden text-sm text-[#8f9da8] lg:block">
              CloudWise <span className="mx-2">/</span>
              <span className="text-[#e8eef0]">{activeNav}</span>
            </div>
            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.04]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34434e] text-white">
                  <CircleUserRound size={18} />
                </span>
                <span className="hidden text-sm sm:block">{userName || 'User'}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#9aa8b4] transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#141e25] p-1.5 shadow-xl">
                  <div className="border-b border-white/[0.07] px-3 py-2">
                    <p className="truncate text-sm font-medium text-white">{userName || 'User'}</p>
                    <p className="mt-0.5 text-xs text-[#8f9da8]">CloudWise account</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('Settings');
                      setProfileOpen(false);
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#c0cbd2] hover:bg-white/[0.05]"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout?.();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-400/10"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-7 sm:py-8 xl:px-9">
            <div className="mx-auto w-full max-w-[1440px]">
              {notice && (
                <div
                  role="status"
                  className="mb-5 flex items-start gap-2 rounded-lg border border-[#a7f3d0]/20 bg-[#193029]/60 px-4 py-3 text-sm text-[#c7f8df]"
                >
                  <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                  {notice}
                  <button
                    type="button"
                    className="ml-auto"
                    onClick={() => setNotice('')}
                    aria-label="Dismiss message"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {activeNav === 'Home' && (
                <>
                  <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a7f3d0]">
                      Cloud account workspace
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[30px]">
                      Connect your cloud accounts
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9aa8b4]">
                      Connect a cloud provider to analyze resource utilization, identify cost
                      issues, and review optimization opportunities.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {providers.map((provider) => (
                      <section
                        key={provider.id}
                        className="flex min-h-[260px] flex-col rounded-xl border border-white/[0.07] bg-gradient-to-b from-[#151f26] to-[#121a20] p-6 transition hover:border-[#a7f3d0]/25"
                      >
                        <div className="flex h-16 items-center justify-between">
                          <ProviderMark id={provider.id} className="h-12 w-16" />
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] ${connected.includes(provider.id) ? 'bg-emerald-400/10 text-emerald-300' : provider.id === 'aws' ? 'bg-sky-400/10 text-sky-300' : 'bg-white/[0.05] text-[#8796a1]'}`}
                          >
                            {connected.includes(provider.id)
                              ? 'Connected (demo)'
                              : provider.id === 'aws'
                                ? 'Available for demo'
                                : 'Planned'}
                          </span>
                        </div>
                        <h2 className="mt-4 text-[17px] font-semibold text-[#edf2f5]">
                          {provider.name}
                        </h2>
                        <p className="mt-2 flex-1 text-sm leading-6 text-[#9aa8b4]">
                          {provider.description}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (provider.id === 'aws') {
                              setSelectedProvider('aws');
                              navigate('Analysis');
                            } else
                              setNotice(
                                `${providerName(provider.id)} integration is planned. AWS is the current implementation target.`,
                              );
                          }}
                          className="mt-5 w-full rounded-lg bg-[#a7f3c0] px-4 py-2.5 text-[13px] font-semibold text-[#102019] transition hover:bg-[#c1f9d3]"
                        >
                          {provider.id === 'aws' ? 'Start AWS analysis' : 'Coming soon'}
                        </button>
                      </section>
                    ))}
                  </div>
                  <div className="mt-6 flex items-start gap-2 rounded-xl border border-white/[0.07] bg-[#111a21] p-4 text-xs leading-5 text-[#81909b]">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                    <p>
                      <strong className="font-medium text-[#b8c4cb]">Read-only by design.</strong>{' '}
                      Real cloud access is not connected yet. The current workflow uses illustrative
                      demo data and does not scan or modify cloud resources.
                    </p>
                  </div>
                </>
              )}

              {activeNav === 'Analysis' && (
                <>
                  <div className="mb-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a7f3d0]">
                      Cost intelligence
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[30px]">
                      Run Analysis
                    </h1>
                    <p className="mt-2 text-sm text-[#9aa8b4]">
                      Choose a connected cloud account and region to begin an optimization analysis.
                    </p>
                  </div>
                  <section className="rounded-xl border border-white/[0.07] bg-[#111a21] p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_auto]">
                      <label className="flex items-center gap-3 rounded-lg border border-white/[0.1] bg-[#0b1116] px-3 py-2.5">
                        <ProviderMark id={selectedProvider} className="h-7 w-10 shrink-0" />
                        <select
                          value={selectedProvider}
                          onChange={(event) =>
                            setSelectedProvider(event.target.value as ProviderId)
                          }
                          className="min-w-0 flex-1 bg-transparent text-sm text-[#e8eef0] outline-none"
                        >
                          {providers.map((provider) => (
                            <option key={provider.id} value={provider.id} className="bg-[#111a21]">
                              {provider.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="text-[#82909b]" />
                      </label>
                      <label className="flex items-center gap-3 rounded-lg border border-white/[0.1] bg-[#0b1116] px-3 py-2.5">
                        <Cloud size={18} className="shrink-0 text-[#9aa8b4]" />
                        <select
                          value={region}
                          onChange={(event) => setRegion(event.target.value)}
                          className="min-w-0 flex-1 bg-transparent text-sm text-[#e8eef0] outline-none"
                        >
                          {regions.map((item) => (
                            <option key={item.value} value={item.value} className="bg-[#111a21]">
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="text-[#82909b]" />
                      </label>
                      <button
                        type="button"
                        onClick={startAnalysis}
                        disabled={isRunning}
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#a7f3c0] px-5 py-3 text-sm font-semibold text-[#102019] transition hover:bg-[#c1f9d3] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRunning ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <ChartNoAxesCombined size={17} />
                        )}
                        {isRunning ? 'Analyzing…' : 'Run Analysis'}
                      </button>
                    </div>

                    <div className="mt-3 space-y-2 text-xs text-[#71818c]">
                      {isLoadingAws ? (
                        <p>Loading AWS resources...</p>
                      ) : awsError ? (
                        <p className="text-red-300">
                          AWS resource loading failed: {awsError}
                        </p>
                      ) : awsLoaded ? (
                        <p className="text-emerald-300">
                          AWS connected · {ec2Instances.length} EC2 instances ·{' '}
                          {ebsVolumes.length} EBS volumes
                        </p>
                      ) : (
                        <p>AWS resource data has not loaded yet.</p>
                      )}
                    </div>

                  </section>
                  <section className="mt-5 rounded-xl border border-white/[0.07] bg-gradient-to-br from-[#121d24] to-[#10181e] p-5 sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                        <svg
                          viewBox="0 0 100 100"
                          className="absolute inset-0 h-full w-full -rotate-90"
                          aria-hidden="true"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="43"
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="8"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="43"
                            fill="none"
                            stroke="#a7f3c0"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 43}`}
                            strokeDashoffset={`${2 * Math.PI * 43 * (1 - (isRunning ? progress : 0) / 100)}`}
                            className="transition-[stroke-dashoffset] duration-500 ease-out"
                          />
                        </svg>
                        <span className="relative text-lg font-semibold tabular-nums">
                          {isRunning ? progress : 0}%
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-semibold text-white">
                            {isRunning ? 'Analysis in Progress' : 'Ready to analyze'}
                          </h2>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isRunning ? 'bg-sky-400/10 text-sky-300' : 'bg-white/[0.06] text-[#9aa8b4]'}`}
                          >
                            {isRunning ? 'In Progress' : 'Waiting to start'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#aab6bf]">
                          {isRunning
                            ? [
                              'Preparing analysis…',
                              'Fetching resources…',
                              'Scanning compute resources…',
                              'Reviewing storage…',
                              'Analyzing cost opportunities…',
                              'Saving demo results…',
                            ][stage]
                            : 'Select a cloud account and region, then run an analysis.'}
                        </p>
                        <p className="mt-1 text-xs text-[#71818c]">
                          The workflow stages below are simulated until backend integration is
                          complete.
                        </p>
                      </div>
                    </div>
                    <div className="mt-7 space-y-4">
                      {[
                        'Fetching resources from cloud provider',
                        'Scanning compute instances',
                        'Reviewing storage volumes',
                        'Analyzing cost optimization opportunities',
                        'Preparing report',
                        'Analysis complete',
                      ].map((label, index) => {
                        const complete = isRunning ? index < stage : false;
                        const current = isRunning && index === stage;
                        return (
                          <div key={label} className="flex items-center gap-3">
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${complete ? 'border-[#a7f3c0] bg-[#a7f3c0] text-[#102019]' : current ? 'border-[#a7f3c0] text-[#a7f3c0]' : 'border-[#46545f] text-[#61717d]'}`}
                            >
                              {complete ? (
                                <Check size={14} />
                              ) : current ? (
                                <LoaderCircle size={14} className="animate-spin" />
                              ) : (
                                <Circle size={14} />
                              )}
                            </span>
                            <span
                              className={`flex-1 text-sm ${complete || current ? 'text-[#dce5e9]' : 'text-[#81909b]'}`}
                            >
                              {label}
                            </span>
                            {complete && <span className="text-xs text-[#7f968b]">Done</span>}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {activeNav === 'History' && (
                <>
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a7f3d0]">
                        Reports archive
                      </p>
                      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[30px]">
                        Analysis History
                      </h1>
                      <p className="mt-2 text-sm text-[#9aa8b4]">
                        Review previous runs and inspect their findings.
                      </p>
                    </div>
                    <div className="relative w-full sm:max-w-[300px]">
                      <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71818c]"
                      />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search analyses…"
                        className="w-full rounded-lg border border-white/[0.1] bg-[#10191f] py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-[#64737e] focus:border-[#a7f3d0]/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.5fr)]">
                    <section className="min-w-0 space-y-3">
                      {filteredRecords.map((record) => (
                        <button
                          key={record.id}
                          type="button"
                          onClick={() => {
                            setSelectedRecordId(record.id);
                            setExpandedFinding(record.findings[0]?.id ?? null);
                            setReportTab('Issues');
                          }}
                          className={`w-full rounded-xl border p-4 text-left transition ${selectedRecordId === record.id ? 'border-[#a7f3c0]/70 bg-[#15251f]' : 'border-white/[0.06] bg-[#121b22] hover:border-white/[0.15]'}`}
                        >
                          <div className="flex items-start gap-3">
                            <ProviderMark
                              id={record.provider}
                              className="mt-0.5 h-9 w-11 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-[#e8eef0]">
                                  {record.name}
                                </p>
                                <ChevronRight
                                  size={16}
                                  className="mt-0.5 shrink-0 text-[#81909b]"
                                />
                              </div>
                              <p className="mt-1 text-xs text-[#8796a1]">
                                {providerName(record.provider)} · {record.region}
                              </p>
                              <p className="mt-2 text-xs text-[#a7b3bb]">
                                {record.issues} issues · {money(record.savings)}/month estimated
                              </p>
                              <p className="mt-2 text-[11px] text-[#71818c]">{record.date}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                      {filteredRecords.length === 0 && (
                        <div className="rounded-xl border border-white/[0.07] bg-[#121b22] p-8 text-center text-sm text-[#9aa8b4]">
                          No analyses match your search.
                        </div>
                      )}
                      <p className="px-1 text-xs text-[#71818c]">
                        {records.length} reports · Sample data for UI development
                      </p>
                    </section>
                    {selectedRecord && (
                      <section className="min-w-0 overflow-hidden rounded-xl border border-white/[0.07] bg-[#111a21]">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => navigate('Analysis')}
                              aria-label="Back to analysis"
                              className="rounded-lg p-2 text-[#aab6bf] hover:bg-white/[0.06]"
                            >
                              <ArrowLeft size={18} />
                            </button>
                            <div>
                              <h2 className="text-base font-semibold text-white">
                                Analysis Report
                              </h2>
                              <p className="mt-1 text-xs text-[#81909b]">{selectedRecord.date}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={exportReport}
                            className="flex items-center gap-2 rounded-lg border border-white/[0.12] px-3 py-2 text-xs font-medium text-[#d5dde1] transition hover:bg-white/[0.05]"
                          >
                            <Download size={15} />
                            Export CSV
                          </button>
                        </div>
                        <div className="p-4 sm:p-5">
                          <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-[#17232b] to-[#121a20] p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                              <ProviderMark
                                id={selectedRecord.provider}
                                className="h-12 w-14 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-sm font-semibold text-white">
                                    {selectedRecord.name}
                                  </h3>
                                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                                    {selectedRecord.status}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-[#8d9ca6]">
                                  {providerName(selectedRecord.provider)} · {selectedRecord.region}
                                </p>
                                <p className="mt-1 text-xs text-[#71818c]">{selectedRecord.date}</p>
                              </div>
                            </div>
                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <div className="rounded-lg border border-white/[0.05] bg-[#10191f] p-3">
                                <p className="text-2xl font-semibold tabular-nums text-white">
                                  {selectedRecord.resources}
                                </p>
                                <p className="mt-1 text-xs text-[#8d9ca6]">Resources scanned*</p>
                              </div>
                              <div className="rounded-lg border border-white/[0.05] bg-[#10191f] p-3">
                                <p className="text-2xl font-semibold tabular-nums text-rose-300">
                                  {selectedRecord.issues}
                                </p>
                                <p className="mt-1 text-xs text-[#8d9ca6]">Issues found*</p>
                              </div>
                              <div className="rounded-lg border border-white/[0.05] bg-[#10191f] p-3">
                                <p className="text-2xl font-semibold tabular-nums text-[#a7f3c0]">
                                  {money(selectedRecord.savings)}
                                </p>
                                <p className="mt-1 text-xs text-[#8d9ca6]">Est. monthly savings*</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 flex gap-6 border-b border-white/[0.08]">
                            <button
                              type="button"
                              onClick={() => setReportTab('Issues')}
                              className={`border-b-2 px-1 pb-3 text-sm font-medium ${reportTab === 'Issues' ? 'border-[#a7f3c0] text-[#c9f8dc]' : 'border-transparent text-[#9aa8b4] hover:text-white'}`}
                            >
                              Issues
                            </button>
                            <button
                              type="button"
                              onClick={() => setReportTab('Summary')}
                              className={`border-b-2 px-1 pb-3 text-sm font-medium ${reportTab === 'Summary' ? 'border-[#a7f3c0] text-[#c9f8dc]' : 'border-transparent text-[#9aa8b4] hover:text-white'}`}
                            >
                              Summary
                            </button>
                          </div>
                          {reportTab === 'Issues' ? (
                            <div className="mt-4 space-y-3">
                              {selectedRecord.findings.map((finding) => (
                                <article
                                  key={finding.id}
                                  className="rounded-xl border border-white/[0.07] bg-[#141e25] p-4"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedFinding((current) =>
                                        current === finding.id ? null : finding.id,
                                      )
                                    }
                                    className="flex w-full items-start gap-3 text-left"
                                  >
                                    <span
                                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${finding.severity === 'High' ? 'bg-rose-500/10 text-rose-300' : finding.severity === 'Medium' ? 'bg-amber-400/10 text-amber-300' : 'bg-emerald-400/10 text-emerald-300'}`}
                                    >
                                      {finding.icon === 'server' ? (
                                        <Server size={17} />
                                      ) : finding.icon === 'storage' ? (
                                        <HardDrive size={17} />
                                      ) : (
                                        <ShieldAlert size={17} />
                                      )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-[#e8eef0]">
                                          {finding.title}
                                        </span>
                                        <SeverityPill severity={finding.severity} />
                                      </span>
                                      <span className="mt-1 block break-all font-mono text-[11px] text-[#81909b]">
                                        {finding.resourceId}
                                      </span>
                                      <span className="mt-2 block text-xs leading-5 text-[#9aa8b4]">
                                        {finding.description}
                                      </span>
                                    </span>
                                    <span className="shrink-0 text-right">
                                      <span className="block text-sm font-semibold text-[#b9f2d0]">
                                        {money(finding.savings)}/mo
                                      </span>
                                      <span className="mt-1 block text-[10px] text-[#81909b]">
                                        Estimated savings
                                      </span>
                                      <ChevronDown
                                        size={15}
                                        className={`ml-auto mt-2 text-[#81909b] transition-transform ${expandedFinding === finding.id ? 'rotate-180' : ''}`}
                                      />
                                    </span>
                                  </button>
                                  {expandedFinding === finding.id && (
                                    <div className="ml-11 mt-4 rounded-lg border border-[#a7f3d0]/10 bg-[#0d1718] p-3">
                                      <p className="flex items-center gap-2 text-xs font-semibold text-[#b9f2d0]">
                                        <Sparkles size={14} />
                                        Recommended action
                                      </p>
                                      <p className="mt-2 text-xs leading-5 text-[#b3c0c7]">
                                        {finding.recommendation}
                                      </p>
                                      <p className="mt-3 text-[10px] text-[#71818c]">
                                        Recommendation is illustrative; validate against live
                                        utilization and billing data before making changes.
                                      </p>
                                    </div>
                                  )}
                                </article>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#141e25] p-5">
                              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                <Sparkles size={17} className="text-[#a7f3d0]" />
                                Executive summary
                              </div>
                              <p className="mt-3 text-sm leading-6 text-[#aab6bf]">
                                This sample report contains {selectedRecord.issues} illustrative
                                findings across {selectedRecord.resources} example resources, with
                                estimated opportunities of {money(selectedRecord.savings)} per
                                month. The largest listed opportunity is{' '}
                                {selectedRecord.findings[0]?.title ?? 'resource optimization'}.
                              </p>
                              <div className="mt-4 rounded-lg border border-amber-300/10 bg-amber-300/[0.04] p-3 text-xs leading-5 text-amber-100/80">
                                Demo notice: this report is seeded sample content. Live AWS billing,
                                utilization metrics, and AI-generated explanations are not connected
                                yet.
                              </div>
                            </div>
                          )}
                          <p className="mt-4 text-[10px] leading-4 text-[#687985]">
                            {selectedRecord.id.startsWith('aws-')
                              ? '* Resource counts and findings are based on the live AWS inventory. Savings have not been calculated.'
                              : '* This is sample data for frontend testing, not a live cloud scan.'}
                          </p>
                        </div>
                      </section>
                    )}
                  </div>
                </>
              )}

              {activeNav === 'Settings' && (
                <>
                  <div className="mb-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a7f3d0]">
                      Workspace preferences
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[30px]">
                      Settings
                    </h1>
                    <p className="mt-2 text-sm text-[#9aa8b4]">
                      Manage your CloudWise demo workspace.
                    </p>
                  </div>
                  <section className="max-w-2xl rounded-xl border border-white/[0.07] bg-[#111a21] p-5">
                    <h2 className="font-semibold text-white">Account</h2>
                    <p className="mt-1 text-sm text-[#9aa8b4]">
                      Signed in as {userName || 'User'}.
                    </p>
                    <div className="mt-5 border-t border-white/[0.07] pt-5">
                      <h3 className="text-sm font-medium text-white">Cloud integrations</h3>
                      <p className="mt-1 text-sm leading-6 text-[#9aa8b4]">
                        AWS analysis currently uses a simulated workflow. AWS IAM read-only
                        integration, Spring Boot APIs, and persisted analysis history are not
                        connected yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('Analysis')}
                        className="mt-4 flex items-center gap-2 rounded-lg bg-[#a7f3c0] px-4 py-2.5 text-sm font-semibold text-[#102019] hover:bg-[#c1f9d3]"
                      >
                        Go to Analysis <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="mt-5 border-t border-white/[0.07] pt-5">
                      <h3 className="text-sm font-medium text-white">Demo data</h3>
                      <p className="mt-1 text-sm text-[#9aa8b4]">
                        {records.length} sample reports available in this browser session.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRecords(initialRecords);
                          setSelectedRecordId(initialRecords[0].id);
                          setNotice('Sample history restored.');
                        }}
                        className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-[#c0cbd2] hover:bg-white/[0.05]"
                      >
                        <RefreshCw size={15} />
                        Reset sample history
                      </button>
                    </div>
                  </section>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}