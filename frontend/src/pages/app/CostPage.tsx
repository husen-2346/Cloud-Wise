import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';

export default function CostPage() {
  return (
    <div>
      <PageHeader
        title="Cost & Usage"
        subtitle="Review historical and active AWS Cost Explorer service expenses."
      />
      <Card>
        <div className="text-center py-12">
          <h2 className="text-base font-semibold text-ink mb-1.5">Cost Explorer Analytics Foundation</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Service cost breakdown, 10-minute caching, and date-range filtering will be implemented in subsequent prompts.
          </p>
        </div>
      </Card>
    </div>
  );
}
