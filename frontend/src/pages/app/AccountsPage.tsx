import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { Plus, ShieldAlert } from 'lucide-react';
import { useConnections } from '../../context/ConnectionsContext';

export default function AccountsPage() {
  const { connections } = useConnections();

  return (
    <div>
      <PageHeader
        title="Cloud Accounts"
        subtitle="Manage connected cloud accounts and their authorization status."
        actions={
          <Link to="/app/connect">
            <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
              Connect Account
            </Button>
          </Link>
        }
      />

      {connections.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <h2 className="text-base font-semibold text-ink mb-1.5">No accounts saved</h2>
            <p className="text-sm text-muted max-w-md mx-auto mb-6">
              You haven't connected any cloud accounts yet.
            </p>
            <Link to="/app/connect">
              <Button variant="primary" size="md">Connect AWS Account</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3.5 rounded-[12px] bg-warning-bg/60 border border-warning/20 text-xs text-warning font-medium">
            <ShieldAlert size={16} className="shrink-0" />
            <span>
              Connection metadata is saved in this browser. The backend does not currently maintain a connection list endpoint.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {connections.map((c) => (
              <Card key={c.connectionId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-semibold text-ink text-base">{c.label || 'AWS Account'}</span>
                    <Badge variant={c.status === 'CONNECTED' ? 'connected' : 'pending'}>
                      {c.status}
                    </Badge>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-bg text-neutral">
                      Saved in this browser
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted">
                    Account: {c.accountId} &bull; ARN: {c.roleArn}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
