import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useConnections } from '../../context/ConnectionsContext';

export default function OverviewPage() {
  const { connections } = useConnections();

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Operational summary of connected cloud resources and spending."
        actions={
          <Link to="/app/connect">
            <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
              Connect Account
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="text-center py-10">
          <h2 className="text-lg font-semibold text-ink mb-2">
            Overview Dashboard Foundation Ready
          </h2>
          <p className="text-sm text-muted max-w-md mx-auto mb-6">
            {connections.length > 0
              ? `${connections.length} account(s) saved in this browser. Dashboard analytics will be implemented in subsequent tasks.`
              : 'No cloud accounts connected yet. Connect an AWS account using cross-account IAM role delegation to begin monitoring.'}
          </p>
          <Link to="/app/connect">
            <Button variant="primary" size="md">
              {connections.length > 0 ? 'Manage Connections' : 'Connect AWS Account'}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
