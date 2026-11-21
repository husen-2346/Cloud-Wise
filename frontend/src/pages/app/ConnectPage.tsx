import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function ConnectPage() {
  const navigate = useNavigate();

  const providers = [
    {
      id: 'aws',
      name: 'Amazon Web Services',
      logo: '/logos/aws.png',
      description:
        'Connect your AWS account using a secure, read-only cross-account IAM Role and External ID.',
      status: 'available' as const,
      statusLabel: 'Available',
      enabled: true,
      action: () => navigate('/app/connect/aws'),
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      logo: '/logos/azure.png',
      description: 'Coming soon. Stay tuned for Azure integration.',
      status: 'coming-soon' as const,
      statusLabel: 'Coming soon',
      enabled: false,
      action: () => {},
    },
    {
      id: 'gcp',
      name: 'Google Cloud',
      logo: '/logos/gcp.png',
      description: 'Coming soon. Stay tuned for Google Cloud integration.',
      status: 'coming-soon' as const,
      statusLabel: 'Coming soon',
      enabled: false,
      action: () => {},
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted font-semibold mb-1">
          GET STARTED
        </p>
        <h1 className="font-sans text-[28px] sm:text-[32px] font-semibold text-ink leading-tight tracking-tight">
          Connect your cloud
        </h1>
        <p className="text-body text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          Choose your cloud provider to bring your infrastructure, usage, and cost data into CloudWise.
        </p>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => (
          <Card
            key={p.id}
            className="flex flex-col justify-between hover:shadow-card transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-app border border-line flex items-center justify-center p-2.5">
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <Badge variant={p.status}>{p.statusLabel}</Badge>
              </div>

              <h2 className="text-base font-semibold text-ink mb-2">
                {p.name}
              </h2>
              <p className="text-sm text-body leading-relaxed mb-6">
                {p.description}
              </p>
            </div>

            <div className="pt-4 border-t border-line">
              <Button
                variant={p.enabled ? 'primary' : 'secondary'}
                size="md"
                disabled={!p.enabled}
                onClick={p.action}
                className="w-full"
                rightIcon={p.enabled ? <ArrowRight size={16} /> : undefined}
              >
                Connect
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
