import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConnections, type ConnectionMetadata } from '../../context/ConnectionsContext';
import { syncResources, syncCosts } from '../../services/awsApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Toast } from '../../components/ui/Toast';
import {
  Plus,
  RefreshCw,
  DollarSign,
  Trash2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function AccountsPage() {
  const { token } = useAuth();
  const { connections, activeConnection, setActive, remove } = useConnections();
  const navigate = useNavigate();

  // In-flight operation states
  const [syncingResourcesId, setSyncingResourcesId] = useState<number | null>(null);
  const [syncingCostsId, setSyncingCostsId] = useState<number | null>(null);

  // Toast / notification state
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    description?: string;
  } | null>(null);

  // Remove confirmation modal state
  const [connectionToRemove, setConnectionToRemove] = useState<ConnectionMetadata | null>(null);

  // Action: Open Overview
  const handleOpenOverview = (conn: ConnectionMetadata) => {
    setActive(conn.connectionId);
    navigate('/app/overview');
  };

  // Action: Sync Resources
  const handleSyncResources = async (connId: number) => {
    if (!token) return;
    setSyncingResourcesId(connId);

    try {
      const result = await syncResources(token, connId);
      setToastMessage({
        type: 'success',
        message: 'Resources Synchronized',
        description: `Successfully synced ${result.instancesSaved} EC2 instances and ${result.volumesSaved} EBS volumes.`,
      });
    } catch (err) {
      setToastMessage({
        type: 'error',
        message: 'Resource Sync Failed',
        description: err instanceof Error ? err.message : 'Unknown synchronization error.',
      });
    } finally {
      setSyncingResourcesId(null);
    }
  };

  // Action: Sync Costs (Last 30 days)
  const handleSyncCosts = async (connId: number) => {
    if (!token) return;
    setSyncingCostsId(connId);

    // Calculate dates: start = 30 days ago, end = today
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];

    try {
      const result = await syncCosts(token, connId, startDate, endDate);
      setToastMessage({
        type: 'success',
        message: 'Costs Synchronized',
        description: `Processed ${result.costRecordsProcessed} service cost records for the last 30 days.`,
      });
    } catch (err) {
      setToastMessage({
        type: 'error',
        message: 'Cost Sync Failed',
        description: err instanceof Error ? err.message : 'Unknown cost synchronization error.',
      });
    } finally {
      setSyncingCostsId(null);
    }
  };

  // Action: Confirm Removal
  const handleConfirmRemove = () => {
    if (!connectionToRemove) return;
    remove(connectionToRemove.connectionId);
    setConnectionToRemove(null);
    setToastMessage({
      type: 'info',
      message: 'Connection Removed',
      description: 'The connection metadata has been cleared from this browser.',
    });
  };

  const otherProviders = [
    {
      id: 'azure',
      name: 'Microsoft Azure',
      logo: '/logos/azure.png',
      status: 'coming-soon' as const,
      description: 'Coming soon. Stay tuned for Azure integration.',
    },
    {
      id: 'gcp',
      name: 'Google Cloud Platform',
      logo: '/logos/gcp.png',
      status: 'coming-soon' as const,
      description: 'Coming soon. Stay tuned for Google Cloud integration.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Toast
            type={toastMessage.type}
            message={toastMessage.message}
            description={toastMessage.description}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted font-semibold mb-1">
            INFRASTRUCTURE
          </p>
          <h1 className="font-sans text-[28px] font-semibold text-ink leading-tight tracking-tight">
            Cloud Accounts
          </h1>
          <p className="text-body text-sm mt-1">
            Manage your connected cloud accounts, synchronize telemetry, and inspect authorization status.
          </p>
        </div>

        <Link to="/app/connect">
          <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
            Connect Account
          </Button>
        </Link>
      </div>

      {/* Main Connection List */}
      {connections.length === 0 ? (
        <Card className="text-center py-12 px-6">
          <div className="w-12 h-12 rounded-2xl bg-tint text-brand-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-lg font-semibold text-ink mb-1.5">
            No cloud accounts connected
          </h2>
          <p className="text-sm text-muted max-w-md mx-auto mb-6 leading-relaxed">
            Connect your AWS account via a read-only IAM role to start analyzing usage,
            inventory, and cloud costs.
          </p>
          <Link to="/app/connect">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
              Connect AWS account
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map((c) => {
            const isActive = activeConnection?.connectionId === c.connectionId;
            const isConnected = c.status === 'CONNECTED';
            const formattedDate = c.createdAt
              ? new Date(c.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : null;

            return (
              <Card
                key={c.connectionId}
                className={`transition-all duration-200 ${
                  isActive ? 'ring-2 ring-brand-500/30 border-brand-500/40' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Account Details */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-app border border-line flex items-center justify-center p-2 shrink-0">
                      <img
                        src="/logos/aws.png"
                        alt="AWS"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-base font-semibold text-ink truncate">
                          {c.label || `AWS Account (${c.accountId})`}
                        </h2>

                        <Badge
                          variant={isConnected ? 'connected' : 'pending'}
                        >
                          {c.status}
                        </Badge>

                        {isActive && (
                          <span className="text-[11px] font-semibold text-brand-600 bg-tint px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-xs text-muted space-y-0.5">
                        <p>
                          Account ID: <span className="text-ink select-all">{c.accountId}</span>
                        </p>
                        <p className="truncate max-w-md sm:max-w-xl select-all">
                          Role ARN: {c.roleArn}
                        </p>
                      </div>

                      {formattedDate && (
                        <p className="text-[11px] text-muted">
                          Saved in this browser on {formattedDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-line">
                    {isConnected ? (
                      <>
                        <Button
                          variant="secondary"
                          size="md"
                          isLoading={syncingResourcesId === c.connectionId}
                          disabled={syncingResourcesId === c.connectionId || syncingCostsId === c.connectionId}
                          onClick={() => handleSyncResources(c.connectionId)}
                          leftIcon={<RefreshCw size={14} />}
                          title="Sync EC2 instances and EBS volumes"
                        >
                          Sync resources
                        </Button>

                        <Button
                          variant="secondary"
                          size="md"
                          isLoading={syncingCostsId === c.connectionId}
                          disabled={syncingResourcesId === c.connectionId || syncingCostsId === c.connectionId}
                          onClick={() => handleSyncCosts(c.connectionId)}
                          leftIcon={<DollarSign size={14} />}
                          title="Sync last 30 days of service costs"
                        >
                          Sync costs
                        </Button>

                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => handleOpenOverview(c)}
                          rightIcon={<ArrowRight size={14} />}
                        >
                          Open overview
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() =>
                          navigate(`/app/connect/aws?connectionId=${c.connectionId}`)
                        }
                        rightIcon={<ExternalLink size={14} />}
                      >
                        Resume setup
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => setConnectionToRemove(c)}
                      className="text-muted hover:text-danger hover:bg-danger-bg/50"
                      title="Remove from this browser"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footnote on Browser-Side Connection Storage */}
      <div className="flex items-center gap-2 text-xs text-muted px-1">
        <Info size={14} className="shrink-0" />
        <span>
          Connections are saved in this browser.
        </span>
      </div>

      {/* Other Providers Section */}
      <div className="pt-6 border-t border-line">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-4">
          Other Cloud Providers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {otherProviders.map((provider) => (
            <Card key={provider.id} className="opacity-75">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-app border border-line flex items-center justify-center p-2 shrink-0">
                    <img
                      src={provider.logo}
                      alt={provider.name}
                      className="max-h-full max-w-full object-contain grayscale opacity-75"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      {provider.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {provider.description}
                    </p>
                  </div>
                </div>

                <Badge variant={provider.status}>Coming soon</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Removal */}
      {connectionToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface rounded-2xl border border-line shadow-card p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-danger-bg text-danger flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Remove connection reference?
                </h3>
                <p className="text-xs text-muted mt-1">
                  {connectionToRemove.label || connectionToRemove.accountId}
                </p>
              </div>
            </div>

            <Alert variant="warning">
              This removes the saved connection reference from this browser only. It does not delete the IAM role in AWS or remove the connection from the CloudWise server.
            </Alert>

            <div className="pt-3 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setConnectionToRemove(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmRemove}
              >
                Remove from browser
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
