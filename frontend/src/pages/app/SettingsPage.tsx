import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Account preferences, session information, and configuration."
      />

      <div className="space-y-6 max-w-2xl">
        <Card>
          <h2 className="text-base font-semibold text-ink mb-4">Account Profile</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted block text-xs">Name</span>
              <span className="font-medium text-ink">{user?.name || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-muted block text-xs">Email</span>
              <span className="font-medium text-ink">{user?.email}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
