import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Cloud,
  HardDrive,
  Trash2,
  ExternalLink,
  RefreshCw,
  Coins,
  Clock,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Toast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { useConnections } from '../../context/ConnectionsContext';
import { clearAnalysisHistory } from '../../types/analysis';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connections, activeConnection, remove, setActive } = useConnections();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const handleClearHistory = () => {
    if (user?.email) {
      clearAnalysisHistory(user.email);
      setToastMessage('Analysis history removed from this browser.');
      setConfirmAction(null);
    }
  };

  const handleClearConnections = () => {
    connections.forEach((c) => remove(c.connectionId));
    setActive(null);
    setToastMessage('Cached connections removed from this browser.');
    setConfirmAction(null);
  };

  const handleResetAll = () => {
    if (user?.email) {
      clearAnalysisHistory(user.email);
    }
    connections.forEach((c) => remove(c.connectionId));
    setActive(null);
    setToastMessage('All local browser cache and data reset successfully.');
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, cloud provider integrations, and browser storage."
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Confirmation modal/alert for destructive actions */}
      {confirmAction && (
        <Alert
          variant="warning"
          title={`Confirm ${confirmAction}`}
          onClose={() => setConfirmAction(null)}
        >
          <div className="space-y-2 text-xs">
            <p>
              Are you sure you want to proceed? This will erase the selected data stored in this browser session.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="danger"
                size="md"
                onClick={
                  confirmAction === 'Clear History'
                    ? handleClearHistory
                    : confirmAction === 'Clear Connections'
                      ? handleClearConnections
                      : handleResetAll
                }
              >
                Yes, Proceed
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Account Profile Card */}
      <Card>
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tint text-brand-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Account Profile</h2>
            <p className="text-xs text-muted">Your authenticated user details</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          <div>
            <span className="text-muted block">Full Name</span>
            <span className="font-semibold text-ink text-sm">
              {user?.name || user?.email?.split('@')[0] || 'CloudWise User'}
            </span>
          </div>

          <div>
            <span className="text-muted block">Email Address</span>
            <span className="font-semibold text-ink text-sm">
              {user?.email || 'user@example.com'}
            </span>
          </div>

          <div>
            <span className="text-muted block">Subscription Tier</span>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Badge variant="in-use">Community Edition</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Cloud Providers & Connected Accounts */}
      <Card>
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tint text-brand-600">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">Connected Cloud Accounts</h2>
              <p className="text-xs text-muted">Active cloud integrations and status</p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/app/accounts')}
          >
            Manage Accounts
            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {/* AWS Account Item */}
          <div className="flex flex-col gap-3 rounded-xl border border-line bg-app/50 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logos/aws.png"
                alt="AWS"
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink">Amazon Web Services</span>
                  <Badge variant="connected">
                    {connections.length > 0 ? `${connections.length} Connected` : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted">
                  {activeConnection
                    ? `Active account: ${activeConnection.accountId || activeConnection.label || `#${activeConnection.connectionId}`}`
                    : 'IAM cross-account role connection'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => navigate('/app/connect/aws')}
              >
                + Connect Another
              </Button>
            </div>
          </div>

          {/* Azure (Coming Soon) */}
          <div className="flex items-center justify-between rounded-xl border border-line/60 bg-app/30 p-3.5 opacity-70">
            <div className="flex items-center gap-3">
              <img
                src="/logos/azure.png"
                alt="Azure"
                className="h-8 w-8 object-contain grayscale"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink">Microsoft Azure</span>
                  <Badge variant="coming-soon">Coming Soon</Badge>
                </div>
                <p className="text-[11px] text-muted">Azure subscription analysis in future release</p>
              </div>
            </div>
            <span className="text-xs text-muted font-medium">Inactive</span>
          </div>

          {/* Google Cloud (Coming Soon) */}
          <div className="flex items-center justify-between rounded-xl border border-line/60 bg-app/30 p-3.5 opacity-70">
            <div className="flex items-center gap-3">
              <img
                src="/logos/gcp.png"
                alt="GCP"
                className="h-8 w-8 object-contain grayscale"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink">Google Cloud Platform</span>
                  <Badge variant="coming-soon">Coming Soon</Badge>
                </div>
                <p className="text-[11px] text-muted">GCP project resource optimization in future release</p>
              </div>
            </div>
            <span className="text-xs text-muted font-medium">Inactive</span>
          </div>
        </div>
      </Card>

      {/* Display & Regional Preferences */}
      <Card>
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tint text-brand-600">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Display & Telemetry Preferences</h2>
            <p className="text-xs text-muted">Units and downsampling configuration</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-line bg-app/50 p-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-brand-600" />
              <span className="font-semibold text-ink">Currency Presentation</span>
            </div>
            <p className="mt-1 text-muted">
              USD default. Values strictly follow the currency unit returned by the AWS Cost Explorer API.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-app/50 p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-600" />
              <span className="font-semibold text-ink">Telemetry Aggregation</span>
            </div>
            <p className="mt-1 text-muted">
              CloudWatch 5-minute data downsampled to 30-minute (24h) and 3-hour (7d) averages per DESIGN.md.
            </p>
          </div>
        </div>
      </Card>

      {/* Browser Local Data & Cache Management */}
      <Card className="border-danger/20">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-bg text-danger">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Browser Storage & Cache Management</h2>
            <p className="text-xs text-muted">
              Manage local browser-saved connection references and analysis runs
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <Alert variant="info" title="Browser Storage Notice">
            Per DESIGN.md, CloudWise stores connection metadata and recent analysis runs locally in your browser (`localStorage`) to preserve state across page reloads. CloudWise never stores AWS secret access keys or permanent credentials.
          </Alert>

          <div className="divide-y divide-line/60 text-xs">
            <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-ink">Clear Analysis History</p>
                <p className="text-muted">
                  Removes all past local analysis scans and Gemini explanations for {user?.email}.
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setConfirmAction('Clear History')}
                className="text-danger hover:bg-danger-bg border-danger/30"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Clear History
              </Button>
            </div>

            <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-ink">Clear Cached Connection References</p>
                <p className="text-muted">
                  Clears locally saved AWS connection IDs and restored state from this browser.
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setConfirmAction('Clear Connections')}
                className="text-danger hover:bg-danger-bg border-danger/30"
              >
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Clear Connections
              </Button>
            </div>

            <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-ink">Reset All Local Application Data</p>
                <p className="text-muted">
                  Removes both connection references and analysis history for a clean session state.
                </p>
              </div>
              <Button
                variant="danger"
                size="md"
                onClick={() => setConfirmAction('Reset All Data')}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Reset Everything
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
