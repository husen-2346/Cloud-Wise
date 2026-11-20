import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';

export default function InsightsPage() {
  return (
    <div>
      <PageHeader
        title="AI Insights"
        subtitle="AI-generated cost optimization recommendations and context explanations."
      />
      <Card>
        <div className="text-center py-12">
          <h2 className="text-base font-semibold text-ink mb-1.5">AI Insights Foundation</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            AI explanation of resource evidence using the Gemini API will be implemented in subsequent prompts.
          </p>
        </div>
      </Card>
    </div>
  );
}
