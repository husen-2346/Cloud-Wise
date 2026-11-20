import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';

export default function HistoryPage() {
  return (
    <div>
      <PageHeader
        title="History"
        subtitle="Review past optimization recommendations and local browser analyses."
      />
      <Card>
        <div className="text-center py-12">
          <h2 className="text-base font-semibold text-ink mb-1.5">Analysis History Foundation</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            Local browser-saved history tracking (up to 20 items per DESIGN.md section 11) will be implemented in subsequent prompts.
          </p>
        </div>
      </Card>
    </div>
  );
}
