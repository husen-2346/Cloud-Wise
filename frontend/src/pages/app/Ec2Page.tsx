import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';

export default function Ec2Page() {
  return (
    <div>
      <PageHeader
        title="EC2 Instances"
        subtitle="Inspect virtual compute instances, state, types, and utilization across regions."
      />
      <Card>
        <div className="text-center py-12">
          <h2 className="text-base font-semibold text-ink mb-1.5">EC2 Inventory Foundation</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Live EC2 inventory discovery and telemetry will be implemented in subsequent prompts using the verified AWS API service.
          </p>
        </div>
      </Card>
    </div>
  );
}
