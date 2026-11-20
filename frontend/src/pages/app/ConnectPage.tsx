import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Cloud, ArrowRight } from 'lucide-react';

export default function ConnectPage() {
  const providers = [
    {
      id: 'aws',
      name: 'Amazon Web Services',
      description: 'Connect via cross-account IAM Role ARN and external ID.',
      status: 'available' as const,
      link: '/app/connect/aws',
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      description: 'Connect via Azure Service Principal.',
      status: 'coming-soon' as const,
      link: null,
    },
    {
      id: 'gcp',
      name: 'Google Cloud Platform',
      description: 'Connect via Google Cloud Workload Identity.',
      status: 'coming-soon' as const,
      link: null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Connect Cloud Account"
        subtitle="Select a cloud provider to grant read-only optimization access to your infrastructure."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => (
          <Card key={p.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-tint flex items-center justify-center text-brand-500">
                  <Cloud size={20} />
                </div>
                <Badge variant={p.status}>
                  {p.status === 'available' ? 'Available' : 'Coming Soon'}
                </Badge>
              </div>

              <h2 className="text-base font-semibold text-ink mb-1.5">{p.name}</h2>
              <p className="text-sm text-muted leading-relaxed mb-6">
                {p.description}
              </p>
            </div>

            <div>
              {p.link ? (
                <Link to={p.link} className="block">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    rightIcon={<ArrowRight size={16} />}
                  >
                    Configure AWS
                  </Button>
                </Link>
              ) : (
                <Button variant="secondary" size="md" disabled className="w-full">
                  Unavailable
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
