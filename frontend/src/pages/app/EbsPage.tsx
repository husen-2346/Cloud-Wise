import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';

export default function EbsPage() {
  return (
    <div>
      <PageHeader
        title="EBS Volumes"
        subtitle="Manage elastic block store volumes, attachment status, and provisioned storage."
      />
      <Card>
        <div className="text-center py-12">
          <h2 className="text-base font-semibold text-ink mb-1.5">EBS Storage Foundation</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            EBS inventory and unattached volume waste discovery will be implemented in subsequent prompts.
          </p>
        </div>
      </Card>
    </div>
  );
}
