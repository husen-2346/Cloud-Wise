import { useState } from 'react';
import { Logo } from '../../components/brand/Logo';
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  StatCard,
  Table,
  Skeleton,
  EmptyState,
  Alert,
  CopyField,
  Stepper,
  Tabs,
  Toast,
  Spinner,
} from '../../components/ui';
import { Search, Server, DollarSign, Activity } from 'lucide-react';

export default function Styleguide() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStep, setCurrentStep] = useState(1);

  const sampleTableData = [
    { id: '1', name: 'Web Server Prod', type: 't3.medium', status: 'running', zone: 'us-east-1a' },
    { id: '2', name: 'Database Replica', type: 'r5.large', status: 'stopped', zone: 'us-east-1b' },
    { id: '3', name: 'Cache Worker', type: 'c5.xlarge', status: 'running', zone: 'us-east-1c' },
  ];

  const tableColumns = [
    { key: 'name', header: 'Resource Name' },
    { key: 'type', header: 'Instance Type', render: (row: typeof sampleTableData[0]) => <code className="font-mono text-xs">{row.type}</code> },
    {
      key: 'status',
      header: 'Status',
      render: (row: typeof sampleTableData[0]) => (
        <Badge variant={row.status === 'running' ? 'running' : 'stopped'}>
          {row.status}
        </Badge>
      ),
    },
    { key: 'zone', header: 'Availability Zone' },
  ];

  return (
    <div className="min-h-screen bg-app p-8 max-w-6xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="border-b border-line pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="pending">Development Environment Only</Badge>
        </div>
        <h1 className="text-3xl font-serif font-medium text-ink">CloudWise Design System Styleguide</h1>
        <p className="text-sm text-muted mt-1">
          Component library, design tokens, and interaction states for internal verification.
        </p>
      </div>

      {/* 1. Logos */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">1. Logo Variations</h2>
        <Card className="flex flex-wrap items-center gap-8">
          <div>
            <span className="text-xs text-muted block mb-2">Large</span>
            <Logo size="lg" />
          </div>
          <div>
            <span className="text-xs text-muted block mb-2">Medium (Default)</span>
            <Logo size="md" />
          </div>
          <div>
            <span className="text-xs text-muted block mb-2">Small</span>
            <Logo size="sm" />
          </div>
          <div>
            <span className="text-xs text-muted block mb-2">Icon Only</span>
            <Logo size="md" iconOnly />
          </div>
        </Card>
      </section>

      {/* 2. Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">2. Buttons & States</h2>
        <Card className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="md">Primary Button</Button>
            <Button variant="secondary" size="md">Secondary Button</Button>
            <Button variant="ghost" size="md">Ghost Button</Button>
            <Button variant="danger" size="md">Danger Button</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg">Large Primary</Button>
            <Button variant="primary" size="md" isLoading>Loading State</Button>
            <Button variant="primary" size="md" disabled>Disabled State</Button>
          </div>
        </Card>
      </section>

      {/* 3. Inputs & Selects */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">3. Inputs & Selects</h2>
        <Card className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Standard Input" placeholder="Type something..." />
          <Input label="With Left Icon" placeholder="Search resources..." leftIcon={<Search size={18} />} />
          <Input label="Password Input" type="password" placeholder="Enter password" />
          <Input label="Error Validation State" placeholder="Invalid input" error="This field is required." />
          <Select
            label="Dropdown Select"
            options={[
              { value: 'all', label: 'All Regions' },
              { value: 'us-east-1', label: 'US East (N. Virginia)' },
              { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
            ]}
          />
          <Select
            label="Select with Error"
            error="Please select an option"
            options={[{ value: '', label: 'Select region...' }]}
          />
        </Card>
      </section>

      {/* 4. Badges */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">4. Badges</h2>
        <Card className="flex flex-wrap gap-3">
          <Badge variant="available">available</Badge>
          <Badge variant="connected">connected</Badge>
          <Badge variant="pending">pending</Badge>
          <Badge variant="coming-soon">coming-soon</Badge>
          <Badge variant="failed">failed</Badge>
          <Badge variant="running">running</Badge>
          <Badge variant="stopped">stopped</Badge>
          <Badge variant="in-use">in-use</Badge>
          <Badge variant="unattached">unattached</Badge>
        </Card>
      </section>

      {/* 5. StatCards */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">5. Stat Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            label="Monthly Spend"
            value="$1,248.50"
            change="-14.2%"
            changeType="positive"
            subtitle="vs last month"
            icon={<DollarSign size={18} />}
          />
          <StatCard
            label="Active Instances"
            value="18"
            change="+2"
            changeType="neutral"
            subtitle="2 stopped"
            icon={<Server size={18} />}
          />
          <StatCard
            label="CPU Utilization"
            isLoading
            icon={<Activity size={18} />}
          />
        </div>
      </section>

      {/* 6. Tables */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">6. Table (Standard & Loading)</h2>
        <Table
          columns={tableColumns}
          data={sampleTableData}
          keyExtractor={(r) => r.id}
        />
        <div className="pt-2">
          <span className="text-xs text-muted block mb-2">Table Loading Skeleton:</span>
          <Table
            columns={tableColumns}
            data={[]}
            keyExtractor={(r) => r.id}
            isLoading
          />
        </div>
      </section>

      {/* 7. Alerts */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">7. Alerts</h2>
        <div className="space-y-3">
          <Alert variant="info" title="Information Note">
            CloudWatch CPU metrics are collected at 5-minute resolution and downsampled for display.
          </Alert>
          <Alert variant="success" title="Verification Succeeded">
            Your AWS cross-account connection has been established.
          </Alert>
          <Alert variant="warning" title="Configuration Warning">
            CloudWise trusted principal ARN has not been configured in the frontend environment.
          </Alert>
          <Alert variant="error" title="Action Required">
            IAM Role authorization failed. Please check the external ID trust relationship.
          </Alert>
        </div>
      </section>

      {/* 8. Utility Components: CopyField, Stepper, Tabs, Toasts, Skeletons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">8. Utility Controls</h2>
        <Card className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">CopyField</h3>
            <CopyField
              label="External ID (One-time setup)"
              value="cw-ext-8942b0fa17cd49e89d2"
              helperText="Paste this value into your AWS role trust policy Condition block."
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">Stepper Wizard</h3>
            <Stepper
              steps={[
                { id: 1, title: 'AWS Account ID' },
                { id: 2, title: 'External ID' },
                { id: 3, title: 'Verify' },
              ]}
              currentStep={currentStep}
              onStepClick={(idx) => setCurrentStep(idx)}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">Tabs with Underline Indicator</h3>
            <Tabs
              tabs={[
                { id: 'overview', label: 'Overview', count: 3 },
                { id: 'performance', label: 'Performance' },
                { id: 'costs', label: 'Costs' },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <Toast
              type="success"
              message="Connection Verified"
              description="AWS cross-account credentials successfully assumed."
            />
            <Toast
              type="error"
              message="Request Failed"
              description="Unable to reach the CloudWatch endpoint."
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">Spinners</h3>
            <div className="flex items-center gap-6">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">Skeletons</h3>
            <div className="space-y-2">
              <Skeleton height="24px" width="80%" />
              <Skeleton height="16px" width="50%" />
              <Skeleton height="16px" width="65%" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink mb-3">Empty State</h3>
            <EmptyState
              title="No volumes found"
              description="No EBS volumes were detected in the connected AWS account."
              action={<Button variant="secondary" size="md">Refresh Inventory</Button>}
            />
          </div>
        </Card>
      </section>
    </div>
  );
}
