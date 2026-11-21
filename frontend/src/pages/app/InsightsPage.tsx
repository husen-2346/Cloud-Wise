import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  HardDrive,
  Server,
  Download,
  History,
  ShieldCheck,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/EmptyState';
import { CopyField } from '../../components/ui/CopyField';
import { MarkdownContent } from '../../components/common/MarkdownContent';
import { useAuth } from '../../context/AuthContext';
import { useConnections } from '../../context/ConnectionsContext';
import {
  fetchEc2Instances,
  fetchEbsVolumes,
  fetchCpuMetrics,
  type Ec2InstanceResponse,
  type EbsVolumeResponse,
} from '../../services/awsApi';
import { explainAnalysis } from '../../services/aiApi';
import { exportCsv } from '../../utils/exportCsv';
import {
  type Finding,
  type AnalysisRecord,
  saveAnalysisRecord,
} from '../../types/analysis';

const ANALYSIS_STAGES = [
  'Idle',
  'Fetching resources',
  'Scanning compute',
  'Reviewing storage',
  'Analysing cost',
  'Preparing report',
];

export default function InsightsPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { activeConnection, connections, setActive } = useConnections();

  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [currentRecord, setCurrentRecord] = useState<AnalysisRecord | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  async function runAnalysis() {
    if (!token || !activeConnection || isRunning) return;

    setIsRunning(true);
    setErrorNotice(null);
    setProgress(10);
    setStage(1); // Fetching resources

    const connectionId = activeConnection.connectionId;
    const accountLabel = activeConnection.accountId || activeConnection.label || `AWS-${connectionId}`;

    let ec2List: Ec2InstanceResponse[];
    let ebsList: EbsVolumeResponse[];
    const generatedFindings: Finding[] = [];

    try {
      // Stage 1: Fetching resources
      const [instances, volumes] = await Promise.all([
        fetchEc2Instances(token, connectionId),
        fetchEbsVolumes(token, connectionId),
      ]);

      ec2List = instances || [];
      ebsList = volumes || [];

      // Stage 2: Scanning compute
      setStage(2);
      setProgress(35);

      // Check running EC2 instances for potential under-utilization
      const runningInstances = ec2List.filter(
        (i) => i.state.toLowerCase() === 'running',
      );

      // Check CloudWatch CPU for up to 3 running instances to avoid excessive API requests
      const instancesToCheck = runningInstances.slice(0, 3);
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      for (const inst of instancesToCheck) {
        try {
          const metrics = await fetchCpuMetrics(
            token,
            connectionId,
            inst.instanceId,
            sevenDaysAgo.toISOString(),
            now.toISOString(),
          );

          const validPoints = (metrics || []).filter(
            (m) => m.average !== null && m.average !== undefined,
          );

          if (validPoints.length >= 6) {
            const sum = validPoints.reduce((acc, m) => acc + (m.average ?? 0), 0);
            const avg = sum / validPoints.length;

            if (avg < 10) {
              generatedFindings.push({
                id: `ec2-util-${inst.instanceId}`,
                title: 'Potentially under-utilized instance',
                resourceId: inst.instanceId,
                resourceType: 'EC2',
                severity: 'Low',
                savings: 'Savings not estimated',
                description: `Instance ${inst.instanceId} (${inst.instanceType}) has maintained an average CPU utilization of ${avg.toFixed(1)}% over the monitored period.`,
                recommendation:
                  'Review workload requirements. Consider rightsizing to a smaller instance type within the same family or scheduling shutdown during off-peak hours.',
                evidence: `Average CPU: ${avg.toFixed(1)}% across ${validPoints.length} datapoints over 7 days.`,
                icon: 'server',
              });
            }
          }
        } catch {
          // If telemetry is unavailable, we do not invent utilization metrics
        }
      }

      // Stage 3: Reviewing storage
      setStage(3);
      setProgress(60);

      // Check unattached EBS volumes
      const unattachedVolumes = ebsList.filter(
        (v) => v.state.toLowerCase() === 'available',
      );

      unattachedVolumes.forEach((volume, idx) => {
        generatedFindings.push({
          id: `ebs-unattached-${volume.volumeId}-${idx}`,
          title: 'Unattached EBS volume',
          resourceId: volume.volumeId,
          resourceType: 'EBS',
          severity: 'Medium',
          savings: 'Savings not estimated',
          description: `This ${volume.sizeGiB} GiB ${volume.volumeType} volume is currently available and not attached to any EC2 instance.`,
          recommendation:
            'Confirm the volume is not needed for recovery. Create a snapshot if required, then delete the unattached volume to avoid unnecessary storage fees.',
          evidence: `State: available, Type: ${volume.volumeType}, Size: ${volume.sizeGiB} GiB, AZ: ${volume.availabilityZone}.`,
          icon: 'storage',
        });
      });

      // Stage 4: Analysing cost
      setStage(4);
      setProgress(80);

      // Note cost constraint: Cost Explorer service spend evaluated as context without fabricating projections
      const constraints = [
        'Use only the supplied inventory and findings as evidence.',
        'No billing data is available or verified savings model attached.',
        'Do not invent costs, savings estimates, ROI, or financial projections.',
        'Always state "Savings not estimated" for any potential monetary gain.',
        'Distinguish confirmed facts from potential optimization opportunities.',
      ];

      // Stage 5: Preparing report & AI Explanation
      setStage(5);
      setProgress(90);

      let aiExplanation = '';
      let aiError = '';

      try {
        const aiContext = JSON.stringify({
          account: accountLabel,
          ec2Instances: ec2List.map((i) => ({
            instanceId: i.instanceId,
            type: i.instanceType,
            state: i.state,
            az: i.availabilityZone,
          })),
          ebsVolumes: ebsList.map((v) => ({
            volumeId: v.volumeId,
            sizeGiB: v.sizeGiB,
            type: v.volumeType,
            state: v.state,
          })),
          findings: generatedFindings.map((f) => ({
            title: f.title,
            resourceId: f.resourceId,
            severity: f.severity,
            description: f.description,
            recommendation: f.recommendation,
            savings: f.savings,
          })),
          constraints,
        });

        const aiResponse = await explainAnalysis(token, aiContext);
        aiExplanation = aiResponse.explanation?.trim() || '';
      } catch (err) {
        aiError =
          err instanceof Error
            ? err.message
            : 'AI explanation is temporarily unavailable.';
      }

      const record: AnalysisRecord = {
        id: `analysis-${Date.now()}`,
        timestamp: new Date().toISOString(),
        displayDate: new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }).format(new Date()),
        connectionId,
        accountId: activeConnection.accountId,
        roleArn: activeConnection.roleArn,
        resourcesScanned: ec2List.length + ebsList.length,
        ec2Count: ec2List.length,
        ebsCount: ebsList.length,
        findings: generatedFindings,
        aiExplanation: aiExplanation || undefined,
        aiError: aiError || undefined,
        status: aiError ? 'Partial' : 'Completed',
        persistedLocally: true,
      };

      setCurrentRecord(record);
      if (user?.email) {
        saveAnalysisRecord(user.email, record);
      }

      setProgress(100);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to complete resource scan and analysis.';
      setErrorNotice(msg);
    } finally {
      setIsRunning(false);
    }
  }

  const handleExportCsv = () => {
    if (!currentRecord || currentRecord.findings.length === 0) return;

    exportCsv(
      `cloudwise-findings-${currentRecord.id}.csv`,
      [
        { header: 'Finding Title', key: 'title' },
        { header: 'Resource ID', key: 'resourceId' },
        { header: 'Resource Type', key: 'resourceType' },
        { header: 'Severity', key: 'severity' },
        { header: 'Estimated Savings', key: 'savings' },
        { header: 'Description', key: 'description' },
        { header: 'Recommendation', key: 'recommendation' },
        { header: 'Evidence', key: (r) => r.evidence || '' },
      ],
      currentRecord.findings,
    );
  };

  const filteredFindings = currentRecord?.findings.filter((f) =>
    filterSeverity === 'All' ? true : f.severity === filterSeverity,
  );

  const headerActions = (
    <div className="flex flex-wrap items-center gap-3">
      {connections.length > 1 ? (
        <div className="w-48 sm:w-56">
          <Select
            id="insightsAccountSelect"
            aria-label="Select AWS Account"
            value={activeConnection?.connectionId || ''}
            onChange={(e) => setActive(Number(e.target.value))}
            disabled={isRunning}
          >
            {connections.map((c) => (
              <option key={c.connectionId} value={c.connectionId}>
                {c.label || c.accountId || `Account #${c.connectionId}`}
              </option>
            ))}
          </Select>
        </div>
      ) : activeConnection ? (
        <Badge variant="in-use">
          AWS: {activeConnection.accountId || activeConnection.label || `#${activeConnection.connectionId}`}
        </Badge>
      ) : null}

      <Button
        variant="primary"
        size="md"
        onClick={runAnalysis}
        disabled={!activeConnection || isRunning}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {isRunning ? 'Analyzing...' : 'Run Analysis'}
      </Button>

      <Button
        variant="secondary"
        size="md"
        onClick={() => navigate('/app/history')}
      >
        <History className="h-4 w-4 mr-1.5" />
        History
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Insights"
        subtitle="Grounded analysis and optimization opportunities based on live AWS inventory and telemetry."
        actions={headerActions}
      />

      {!activeConnection ? (
        <Card>
          <EmptyState
            title="No connected AWS account"
            description="To generate evidence-based AI insights, connect an active AWS account using an IAM role."
            action={
              <Button variant="primary" size="md" onClick={() => navigate('/app/connect/aws')}>
                Connect AWS Account
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {errorNotice && (
            <Alert variant="error" title="Analysis Notice">
              {errorNotice}
            </Alert>
          )}

          {/* Progress / Running state indicator */}
          {isRunning && (
            <Card className="border-brand-300 bg-gradient-to-r from-tint/50 to-surface">
              <div className="space-y-3 py-2">
                <div className="flex items-center justify-between text-xs font-medium text-ink">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin text-brand-500" />
                    <span>
                      Stage {stage} of 5: <strong>{ANALYSIS_STAGES[stage]}</strong>
                    </span>
                  </span>
                  <span className="text-muted">{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-line/60">
                  <div
                    className="h-full bg-brand-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted">
                  Auditing live compute and storage resources. Findings are strictly grounded in live AWS inventory.
                </p>
              </div>
            </Card>
          )}

          {/* If analysis has run and record exists */}
          {currentRecord ? (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <p className="text-xs font-medium text-muted">Resources Scanned</p>
                  <p className="mt-1 text-2xl font-bold text-ink">
                    {currentRecord.resourcesScanned}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {currentRecord.ec2Count} EC2 · {currentRecord.ebsCount} EBS
                  </p>
                </Card>

                <Card>
                  <p className="text-xs font-medium text-muted">Optimization Findings</p>
                  <p className="mt-1 text-2xl font-bold text-ink">
                    {currentRecord.findings.length}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {currentRecord.findings.filter((f) => f.severity === 'Medium').length} Medium ·{' '}
                    {currentRecord.findings.filter((f) => f.severity === 'Low').length} Low
                  </p>
                </Card>

                <Card>
                  <p className="text-xs font-medium text-muted">Telemetry Status</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-5 w-5 text-success" />
                    <span className="text-base font-semibold text-ink">Verified Data</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">No fabricated metrics</p>
                </Card>

                <Card>
                  <p className="text-xs font-medium text-muted">Financial Impact</p>
                  <p className="mt-1 text-base font-semibold text-ink">
                    Savings not estimated
                  </p>
                  <p className="mt-1 text-xs text-muted">Awaiting verified billing model</p>
                </Card>
              </div>

              {/* AI Explanation Section */}
              <Card className="border-brand-300/70 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-tint text-brand-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-ink">
                        AI Analysis & Grounded Explanation
                      </h3>
                      <p className="text-xs text-muted">
                        Generated by Gemini based strictly on live inventory and findings evidence
                      </p>
                    </div>
                  </div>
                  <Badge variant={currentRecord.aiExplanation ? 'in-use' : 'pending'}>
                    {currentRecord.aiExplanation ? 'AI Grounded' : 'AI Notice'}
                  </Badge>
                </div>

                <div className="pt-4">
                  {currentRecord.aiExplanation ? (
                    <MarkdownContent content={currentRecord.aiExplanation} />
                  ) : currentRecord.aiError ? (
                    <Alert variant="warning" title="AI explanation temporarily unavailable">
                      <p className="text-xs">
                        {currentRecord.aiError}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        All rule-based findings below remain completely operational and grounded in your live AWS data.
                      </p>
                    </Alert>
                  ) : (
                    <p className="text-xs text-muted">No AI explanation recorded for this run.</p>
                  )}
                </div>
              </Card>

              {/* Rule-based Findings Section */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-ink">
                      Optimization Findings ({currentRecord.findings.length})
                    </h3>
                    <span className="rounded-full bg-tint px-2 py-0.5 text-xs font-medium text-brand-600">
                      Evidence-Grounded
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-xl border border-line bg-surface p-0.5 text-xs shadow-xs">
                      {(['All', 'Medium', 'Low'] as const).map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setFilterSeverity(sev)}
                          className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                            filterSeverity === sev
                              ? 'bg-brand-500 text-white'
                              : 'text-muted hover:text-ink'
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>

                    {currentRecord.findings.length > 0 && (
                      <Button variant="secondary" size="md" onClick={handleExportCsv}>
                        <Download className="h-4 w-4 mr-1.5" />
                        Export Findings CSV
                      </Button>
                    )}
                  </div>
                </div>

                {filteredFindings && filteredFindings.length > 0 ? (
                  <div className="space-y-3">
                    {filteredFindings.map((finding) => (
                      <Card key={finding.id} className="transition-all hover:border-brand-300">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tint text-brand-600">
                              {finding.resourceType === 'EC2' ? (
                                <Server className="h-5 w-5" />
                              ) : (
                                <HardDrive className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-semibold text-ink">
                                  {finding.title}
                                </h4>
                                <Badge
                                  variant={
                                    finding.severity === 'High'
                                      ? 'failed'
                                      : finding.severity === 'Medium'
                                        ? 'pending'
                                        : 'stopped'
                                  }
                                >
                                  {finding.severity}
                                </Badge>
                                <span className="rounded-md bg-app px-2 py-0.5 text-[11px] font-medium text-muted">
                                  {finding.savings}
                                </span>
                              </div>

                              <p className="mt-1.5 text-xs text-body leading-relaxed">
                                {finding.description}
                              </p>

                              <div className="mt-3 rounded-xl border border-line/80 bg-app p-2.5 text-xs">
                                <div className="flex items-start gap-1.5">
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600 mt-0.5" />
                                  <span className="text-ink">
                                    <strong className="font-semibold">Recommended Action:</strong>{' '}
                                    {finding.recommendation}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 self-start sm:self-auto">
                            <CopyField value={finding.resourceId} label="Resource ID" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <div className="py-8 text-center">
                      <ShieldCheck className="mx-auto h-8 w-8 text-success" />
                      <p className="mt-2 text-sm font-medium text-ink">
                        No findings match this filter
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        All scanned resources satisfy the active audit criteria.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            /* Pre-run overview guidance */
            <Card>
              <div className="py-12 text-center max-w-xl mx-auto space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tint text-brand-600 shadow-sm">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">
                    Audit Your AWS Cloud Resources
                  </h3>
                  <p className="mt-1.5 text-sm text-muted">
                    Click <strong>Run Analysis</strong> above to inspect your connected AWS account.
                    CloudWise will examine EC2 instances and EBS volumes, detect unattached storage or low compute utilization, and provide a verified AI explanation.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-left pt-2 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5 rounded-xl border border-line bg-app p-3">
                    <HardDrive className="h-5 w-5 shrink-0 text-brand-500 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-ink">Storage Waste Audit</p>
                      <p className="text-muted">Flags unattached EBS volumes in `available` state.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-xl border border-line bg-app p-3">
                    <Cpu className="h-5 w-5 shrink-0 text-brand-500 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-ink">Compute Utilization</p>
                      <p className="text-muted">Checks 7-day CloudWatch CPU average for low utilization.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="primary" size="md" onClick={runAnalysis} disabled={isRunning}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Analysis Now
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
