import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Sparkles,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  Server,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Alert } from '../../components/ui/Alert';
import { MarkdownContent } from '../../components/common/MarkdownContent';
import { useAuth } from '../../context/AuthContext';
import { exportCsv } from '../../utils/exportCsv';
import {
  type AnalysisRecord,
  getAnalysisHistory,
  clearAnalysisHistory,
} from '../../types/analysis';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisRecord[]>(() =>
    user?.email ? getAnalysisHistory(user.email) : [],
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (user?.email) {
      queueMicrotask(() => {
        setHistory(getAnalysisHistory(user.email));
      });
    }
  }, [user?.email]);

  const handleClearHistory = () => {
    if (user?.email) {
      clearAnalysisHistory(user.email);
      setHistory([]);
      setShowClearConfirm(false);
      setExpandedId(null);
    }
  };

  const handleExportRun = (record: AnalysisRecord) => {
    if (record.findings.length === 0) return;

    exportCsv(
      `cloudwise-analysis-${record.id}.csv`,
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
      record.findings,
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="stopped">
        Saved in this browser ({history.length}/20)
      </Badge>

      {history.length > 0 && (
        <Button
          variant="secondary"
          size="md"
          onClick={() => setShowClearConfirm(true)}
          className="text-danger hover:bg-danger-bg border-danger/30"
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Clear History
        </Button>
      )}

      <Button
        variant="primary"
        size="md"
        onClick={() => navigate('/app/insights')}
      >
        <Sparkles className="h-4 w-4 mr-1.5" />
        New Analysis
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis History"
        subtitle="Review previous optimization scans and AI explanations saved in this browser."
        actions={headerActions}
      />

      {/* Confirmation alert for clearing history */}
      {showClearConfirm && (
        <Alert
          variant="warning"
          title="Clear analysis history from this browser?"
          onClose={() => setShowClearConfirm(false)}
        >
          <div className="space-y-2 text-xs">
            <p>
              This will remove all {history.length} saved analysis reports from your browser's local storage. This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="danger"
                size="md"
                onClick={handleClearHistory}
              >
                Yes, Clear All
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {history.length === 0 ? (
        <Card>
          <EmptyState
            title="No analysis history in this browser"
            description="Run an analysis on the AI Insights page to scan your connected AWS environment and generate grounded recommendations."
            action={
              <Button variant="primary" onClick={() => navigate('/app/insights')}>
                Go to AI Insights
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((record) => {
            const isExpanded = expandedId === record.id;
            const mediumCount = record.findings.filter((f) => f.severity === 'Medium').length;
            const lowCount = record.findings.filter((f) => f.severity === 'Low').length;

            return (
              <Card
                key={record.id}
                className={`transition-all duration-200 ${
                  isExpanded ? 'border-brand-400 shadow-sm' : 'hover:border-line/90'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tint text-brand-600">
                      <HistoryIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink">
                          {record.displayDate}
                        </span>
                        <Badge variant="stopped">
                          {record.accountId ? `AWS: ${record.accountId}` : `Conn #${record.connectionId}`}
                        </Badge>
                        <Badge
                          variant={record.aiExplanation ? 'in-use' : 'pending'}
                        >
                          {record.aiExplanation ? 'AI Grounded' : 'Rule-based only'}
                        </Badge>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                        <span>
                          <strong>{record.resourcesScanned}</strong> resources scanned ({record.ec2Count} EC2, {record.ebsCount} EBS)
                        </span>
                        <span>·</span>
                        <span>
                          <strong>{record.findings.length}</strong> findings ({mediumCount} Medium, {lowCount} Low)
                        </span>
                        <span>·</span>
                        <span>Savings not estimated</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {record.findings.length > 0 && (
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => handleExportRun(record)}
                        title="Export findings to CSV"
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        CSV
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => toggleExpand(record.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          View Details
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Detailed View */}
                {isExpanded && (
                  <div className="mt-5 space-y-5 border-t border-line pt-5">
                    {/* AI Explanation block */}
                    {record.aiExplanation ? (
                      <div className="rounded-2xl border border-line bg-app/60 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-brand-600" />
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">
                            Grounded AI Analysis Summary
                          </h4>
                        </div>
                        <MarkdownContent content={record.aiExplanation} />
                      </div>
                    ) : record.aiError ? (
                      <Alert variant="warning" title="AI summary unavailable for this scan">
                        {record.aiError}
                      </Alert>
                    ) : null}

                    {/* Findings list */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                        Recorded Optimization Findings ({record.findings.length})
                      </h4>

                      {record.findings.length > 0 ? (
                        <div className="space-y-2.5">
                          {record.findings.map((finding) => (
                            <div
                              key={finding.id}
                              className="rounded-xl border border-line bg-surface p-3.5 text-xs shadow-xs"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {finding.resourceType === 'EC2' ? (
                                    <Server className="h-4 w-4 text-brand-600" />
                                  ) : (
                                    <HardDrive className="h-4 w-4 text-brand-600" />
                                  )}
                                  <span className="font-semibold text-ink">
                                    {finding.title}
                                  </span>
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
                                </div>
                                <code className="rounded bg-app px-2 py-0.5 font-mono text-[11px] text-muted">
                                  {finding.resourceId}
                                </code>
                              </div>

                              <p className="mt-1.5 text-body leading-relaxed">
                                {finding.description}
                              </p>

                              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-app p-2 text-ink">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brand-600 mt-0.5" />
                                <span>
                                  <strong>Action:</strong> {finding.recommendation}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-line bg-app p-4 text-center">
                          <ShieldCheck className="mx-auto h-6 w-6 text-success" />
                          <p className="mt-1 text-xs text-ink font-medium">
                            No efficiency issues detected during this scan.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
