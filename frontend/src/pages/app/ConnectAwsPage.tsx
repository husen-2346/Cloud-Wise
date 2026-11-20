import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Stepper } from '../../components/ui/Stepper';

export default function ConnectAwsPage() {
  const steps = [
    { id: 1, title: 'AWS Account ID' },
    { id: 2, title: 'External ID' },
    { id: 3, title: 'Verify Connection' },
  ];

  return (
    <div>
      <PageHeader
        title="Connect AWS Account"
        subtitle="Delegate secure, read-only cross-account access via IAM Role ARN."
      />

      <div className="max-w-2xl mx-auto space-y-8">
        <Stepper steps={steps} currentStep={0} />

        <Card>
          <div className="text-center py-8">
            <h2 className="text-base font-semibold text-ink mb-2">
              AWS Connection Wizard UI
            </h2>
            <p className="text-sm text-muted max-w-md mx-auto">
              The full 3-step interactive wizard will be implemented in subsequent prompts according to DESIGN.md section 12.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
