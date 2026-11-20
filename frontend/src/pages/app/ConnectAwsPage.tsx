import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConnections, type ConnectionMetadata } from '../../context/ConnectionsContext';
import {
  initiateConnection,
  verifyConnection,
  syncResources,
  type ResourceSyncResult,
} from '../../services/awsApi';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Stepper } from '../../components/ui/Stepper';
import { CopyField } from '../../components/ui/CopyField';
import { Spinner } from '../../components/ui/Spinner';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  Shield,
  Copy,
  Check,
} from 'lucide-react';

export default function ConnectAwsPage() {
  const { token } = useAuth();
  const { connections, add, update, setActive } = useConnections();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Find initial connection from URL search params
  const connIdParam = searchParams.get('connectionId');
  const matchedInitialConnection = connIdParam
    ? connections.find((c) => String(c.connectionId) === connIdParam) || null
    : null;

  // Wizard state initialized from query param if available
  const [selectedConnection, setSelectedConnection] = useState<ConnectionMetadata | null>(
    () => matchedInitialConnection,
  );
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (matchedInitialConnection) {
      return matchedInitialConnection.status === 'CONNECTED' ? 2 : 1;
    }
    return 0;
  });

  // Step 1 Form state
  const [accountId, setAccountId] = useState(
    () => matchedInitialConnection?.accountId || '',
  );
  const [connectionName, setConnectionName] = useState(
    () => matchedInitialConnection?.label || '',
  );
  const [accountError, setAccountError] = useState('');
  const [isInitiating, setIsInitiating] = useState(false);
  const [initiateError, setInitiateError] = useState<string | null>(null);

  // Step 2 state
  const trustPrincipalArn = import.meta.env.VITE_CLOUDWISE_TRUST_PRINCIPAL_ARN || '';
  const [copiedPolicy, setCopiedPolicy] = useState(false);

  // Step 3 Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Resource sync state after verification
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<ResourceSyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const steps = [
    { id: 1, title: 'Account details', description: 'Enter 12-digit AWS ID' },
    { id: 2, title: 'Create IAM role', description: 'Configure trust in AWS' },
    { id: 3, title: 'Verify connection', description: 'Test STS assume-role' },
  ];

  // Derived role ARN
  const derivedRoleArn = accountId
    ? `arn:aws:iam::${accountId}:role/CloudWiseCustomerRole`
    : 'arn:aws:iam::<account-id>:role/CloudWiseCustomerRole';

  // Step 1: Account ID validation
  const validateAccountId = (val: string): boolean => {
    if (!val) {
      setAccountError('AWS Account ID is required.');
      return false;
    }
    if (!/^\d{12}$/.test(val)) {
      setAccountError('AWS Account ID must be exactly 12 numeric digits.');
      return false;
    }
    setAccountError('');
    return true;
  };

  const handleAccountIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 12 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAccountId(cleaned);
    if (accountError) {
      validateAccountId(cleaned);
    }
    if (initiateError) {
      setInitiateError(null);
    }
  };

  // Step 1: Initiate Connection
  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!validateAccountId(accountId)) {
      return;
    }

    setIsInitiating(true);
    setInitiateError(null);

    const roleArn = `arn:aws:iam::${accountId}:role/CloudWiseCustomerRole`;

    try {
      const response = await initiateConnection(token, roleArn);

      const label =
        connectionName.trim() || `AWS Account (${accountId.slice(-4)})`;

      const newConn: ConnectionMetadata = {
        connectionId: response.connectionId,
        accountId: accountId,
        roleArn: response.roleArn,
        externalId: response.externalId,
        status: response.status || 'PENDING',
        label: label,
        createdAt: new Date().toISOString(),
        savedLocally: true,
      };

      add(newConn);
      setSelectedConnection(newConn);
      setCurrentStep(1);
    } catch (err) {
      setInitiateError(
        err instanceof Error ? err.message : 'Failed to initiate connection with AWS.',
      );
    } finally {
      setIsInitiating(false);
    }
  };

  // Step 2 -> 3: Trigger Verification
  const handleStartVerification = async () => {
    if (!token || !selectedConnection) return;

    setCurrentStep(2);
    setIsVerifying(true);
    setVerifyError(null);
    setShowTechnicalDetails(false);

    try {
      const response = await verifyConnection(token, selectedConnection.connectionId);

      const updatedConn: Partial<ConnectionMetadata> = {
        status: response.status || 'CONNECTED',
        accountId: response.accountId,
        roleArn: response.arn || selectedConnection.roleArn,
      };

      update(selectedConnection.connectionId, updatedConn);
      setSelectedConnection((prev) => (prev ? { ...prev, ...updatedConn } : null));
      setActive(selectedConnection.connectionId);
    } catch (err) {
      setVerifyError(
        err instanceof Error
          ? err.message
          : 'Could not assume role. Verification failed.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 3: Resource Sync Action
  const handleSyncResources = async () => {
    if (!token || !selectedConnection) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const result = await syncResources(token, selectedConnection.connectionId);
      setSyncResult(result);
    } catch (err) {
      setSyncError(
        err instanceof Error ? err.message : 'Failed to synchronize AWS resources.',
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Generated JSON trust policy
  const generatedTrustPolicy =
    trustPrincipalArn && selectedConnection?.externalId
      ? JSON.stringify(
          {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  AWS: trustPrincipalArn,
                },
                Action: 'sts:AssumeRole',
                Condition: {
                  StringEquals: {
                    'sts:ExternalId': selectedConnection.externalId,
                  },
                },
              },
            ],
          },
          null,
          2,
        )
      : '';

  const handleCopyTrustPolicy = async () => {
    if (!generatedTrustPolicy) return;
    try {
      await navigator.clipboard.writeText(generatedTrustPolicy);
      setCopiedPolicy(true);
      setTimeout(() => setCopiedPolicy(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-muted font-semibold mb-1">
          AWS CONNECTION WIZARD
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
          Connect your AWS account
        </h1>
        <p className="text-body text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          Delegate secure, read-only cross-account access via an AWS IAM Role and External ID.
        </p>
      </div>

      {/* Two-Column Wizard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vertical Stepper */}
        <div className="md:col-span-4 lg:col-span-4">
          <Card className="sticky top-24">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-4">
              Connection Progress
            </h2>
            <Stepper
              steps={steps}
              currentStep={currentStep}
              orientation="vertical"
              onStepClick={(idx) => {
                // Allow navigating back to completed steps
                if (idx < currentStep) {
                  setCurrentStep(idx);
                }
              }}
            />
          </Card>
        </div>

        {/* Right Column: Main Content Card */}
        <div className="md:col-span-8 lg:col-span-8">
          <Card>
            {/* STEP 1: Account Details */}
            {currentStep === 0 && (
              <div>
                <div className="mb-6 pb-4 border-b border-line">
                  <h2 className="text-xl font-semibold text-ink">
                    1. Account details
                  </h2>
                  <p className="text-sm text-muted mt-1 leading-relaxed">
                    Provide your 12-digit AWS Account ID to derive the role ARN and generate your secure External ID.
                  </p>
                </div>

                {initiateError && (
                  <div className="mb-6">
                    <Alert variant="error" onClose={() => setInitiateError(null)}>
                      {initiateError}
                    </Alert>
                  </div>
                )}

                <form onSubmit={handleInitiate} className="space-y-5" noValidate>
                  <Input
                    label="AWS Account ID"
                    id="awsAccountId"
                    name="awsAccountId"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456789012"
                    value={accountId}
                    onChange={handleAccountIdChange}
                    error={accountError}
                    helperText="Exactly 12 numeric digits (no letters, spaces, or hyphens)."
                    required
                  />

                  <Input
                    label="Connection display name (Optional)"
                    id="connectionName"
                    name="connectionName"
                    type="text"
                    placeholder="Production US East, Staging, etc."
                    value={connectionName}
                    onChange={(e) => setConnectionName(e.target.value)}
                    helperText="Used only for display in your browser."
                  />

                  <CopyField
                    label="Derived IAM Role ARN"
                    value={derivedRoleArn}
                    helperText="CloudWise connects using this standard role name. Read-only."
                  />

                  <div className="pt-4 border-t border-line flex items-center justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isInitiating}
                      disabled={isInitiating || accountId.length !== 12}
                      rightIcon={<ArrowRight size={18} />}
                    >
                      Generate External ID
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: Create IAM Role in AWS */}
            {currentStep === 1 && selectedConnection && (
              <div>
                <div className="mb-6 pb-4 border-b border-line">
                  <h2 className="text-xl font-semibold text-ink">
                    2. Create the IAM role in AWS
                  </h2>
                  <p className="text-sm text-muted mt-1 leading-relaxed">
                    Follow the numbered instructions below in your AWS Management Console.
                  </p>
                </div>

                {/* Configuration Warning if VITE_CLOUDWISE_TRUST_PRINCIPAL_ARN is not set */}
                {!trustPrincipalArn ? (
                  <div className="mb-6">
                    <Alert variant="warning" title="Trust Principal Not Configured">
                      The developer must configure{' '}
                      <code className="font-mono font-semibold text-warning">
                        VITE_CLOUDWISE_TRUST_PRINCIPAL_ARN
                      </code>{' '}
                      in <code className="font-mono">frontend/.env</code>. Without this
                      variable, the exact IAM trust policy cannot be rendered.
                    </Alert>
                  </div>
                ) : null}

                {/* Numbered Setup Instructions */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-semibold text-ink">
                    Instructions:
                  </h3>
                  <ol className="list-decimal list-inside space-y-2.5 text-sm text-body leading-relaxed pl-1">
                    <li>
                      Open the{' '}
                      <a
                        href="https://console.aws.amazon.com/iamv2/home#/roles"
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1"
                      >
                        AWS IAM Console <ExternalLink size={13} />
                      </a>
                      .
                    </li>
                    <li>Navigate to <strong>IAM → Roles → Create role</strong>.</li>
                    <li>Select <strong>AWS account</strong> as the trusted entity.</li>
                    <li>
                      Under "An AWS account", select <strong>Another AWS account</strong> and enter the CloudWise principal ARN:
                      <div className="mt-1.5 pl-4">
                        {trustPrincipalArn ? (
                          <code className="font-mono text-xs px-2.5 py-1 bg-app border border-line rounded-md text-ink select-all">
                            {trustPrincipalArn}
                          </code>
                        ) : (
                          <span className="text-xs text-danger font-medium">
                            (Principal ARN not configured in environment)
                          </span>
                        )}
                      </div>
                    </li>
                    <li>
                      Under "Options", check <strong>Require external ID</strong> and enter the value below.
                    </li>
                    <li>
                      Set the role name to exactly: <code className="font-mono font-semibold text-ink">CloudWiseCustomerRole</code>.
                    </li>
                    <li>Attach the required read-only policies.</li>
                  </ol>
                </div>

                {/* Generated External ID CopyField (amber tinted) */}
                <div className="mb-5 p-4 rounded-xl bg-warning-bg/40 border border-warning/30">
                  <CopyField
                    label="CloudWise External ID (Required for trust condition)"
                    value={selectedConnection.externalId || 'External ID unavailable'}
                    helperText="This unique ID prevents Confused Deputy attacks. Paste this into your AWS IAM role configuration."
                  />
                </div>

                {/* Role Name CopyField */}
                <div className="mb-5">
                  <CopyField
                    label="Role Name"
                    value="CloudWiseCustomerRole"
                    helperText="The role name must match exactly."
                  />
                </div>

                {/* Trust Policy JSON */}
                {trustPrincipalArn && generatedTrustPolicy ? (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-ink">
                        Trust Policy Document (JSON)
                      </label>
                      <button
                        type="button"
                        onClick={handleCopyTrustPolicy}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-500 transition-colors"
                      >
                        {copiedPolicy ? (
                          <>
                            <Check size={14} className="text-success" />
                            <span className="text-success">Copied JSON</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy Policy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-app border border-line text-xs font-mono text-ink overflow-x-auto select-all max-h-60">
                      {generatedTrustPolicy}
                    </pre>
                  </div>
                ) : null}

                {/* Permissions Guidance */}
                <div className="mb-8 p-4 rounded-xl bg-tint/60 border border-brand-300/40 text-xs sm:text-sm text-body space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-ink">
                    <Shield size={16} className="text-brand-600" />
                    <span>Suggested Read-Only Permissions Guidance</span>
                  </div>
                  <p className="leading-relaxed">
                    CloudWise requires read-only permissions to inspect compute and cost telemetry. Minimum suggested actions:
                  </p>
                  <ul className="list-disc list-inside space-y-1 font-mono text-xs text-ink pl-2">
                    <li>ec2:DescribeInstances</li>
                    <li>ec2:DescribeVolumes</li>
                    <li>cloudwatch:GetMetricStatistics</li>
                    <li>ce:GetCostAndUsage</li>
                  </ul>
                  <p className="text-xs text-muted leading-relaxed">
                    Alternatively, attaching the AWS-managed <code className="font-mono text-ink">ReadOnlyAccess</code> policy works. Please review the permissions attached to your role according to your organization's security policy.
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="pt-4 border-t border-line flex items-center justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setCurrentStep(0)}
                    leftIcon={<ArrowLeft size={16} />}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleStartVerification}
                    rightIcon={<ArrowRight size={18} />}
                  >
                    Verify connection
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Verify Connection (Verifying / Success / Failure) */}
            {currentStep === 2 && selectedConnection && (
              <div>
                <div className="mb-6 pb-4 border-b border-line">
                  <h2 className="text-xl font-semibold text-ink">
                    3. Connection status
                  </h2>
                  <p className="text-sm text-muted mt-1 leading-relaxed">
                    Verifying cross-account STS assume-role access with AWS.
                  </p>
                </div>

                {/* In-Flight Verifying State */}
                {isVerifying ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <Spinner size="lg" />
                    <div>
                      <h3 className="text-lg font-semibold text-ink">
                        Verifying your AWS connection...
                      </h3>
                      <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
                        Attempting to assume the role using the provided External ID. This may take a few moments.
                      </p>
                    </div>
                  </div>
                ) : verifyError ? (
                  /* Failure State */
                  <div className="space-y-6">
                    <Alert
                      variant="error"
                      title="Connection Verification Failed"
                    >
                      CloudWise could not assume the specified role in your AWS account.
                    </Alert>

                    {/* Troubleshooting Checklist */}
                    <div className="p-5 rounded-2xl bg-surface border border-line space-y-3">
                      <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                        <AlertTriangle size={16} className="text-warning" />
                        Troubleshooting Checklist
                      </h3>
                      <ul className="space-y-2 text-xs sm:text-sm text-body">
                        <li className="flex items-start gap-2">
                          <span className="text-muted font-bold">&bull;</span>
                          <span>The role name is exactly <code className="font-mono text-ink">CloudWiseCustomerRole</code>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-muted font-bold">&bull;</span>
                          <span>The External ID in the trust policy matches the value generated by CloudWise.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-muted font-bold">&bull;</span>
                          <span>The trusted principal ARN is correctly set.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-muted font-bold">&bull;</span>
                          <span>Wait approximately one minute for newly created IAM changes to propagate globally in AWS.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Collapsible Technical Details */}
                    <div className="rounded-xl border border-line overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowTechnicalDetails((prev) => !prev)}
                        className="w-full px-4 py-3 bg-app flex items-center justify-between text-xs font-semibold text-ink hover:bg-tint transition-colors"
                      >
                        <span>Technical details</span>
                        {showTechnicalDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {showTechnicalDetails && (
                        <pre className="p-4 text-xs font-mono text-danger bg-danger-bg/30 border-t border-line overflow-x-auto whitespace-pre-wrap">
                          {verifyError}
                        </pre>
                      )}
                    </div>

                    {/* Retry Button */}
                    <div className="pt-4 border-t border-line flex items-center justify-between">
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={() => setCurrentStep(1)}
                        leftIcon={<ArrowLeft size={16} />}
                      >
                        Review IAM settings
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={handleStartVerification}
                        leftIcon={<RefreshCw size={16} />}
                      >
                        Try again
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Success State (CONNECTED) */
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-success-bg/40 border border-success/30 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center text-white shrink-0 mt-0.5">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-ink">
                            Connection Established Successfully
                          </h3>
                          <Badge variant="connected">CONNECTED</Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-body leading-relaxed">
                          CloudWise has verified read-only access to your AWS account. You can now synchronize inventory and view cost telemetry.
                        </p>
                      </div>
                    </div>

                    {/* Confirmed Details */}
                    <div className="p-4 rounded-xl bg-app border border-line space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted font-medium">Confirmed Account ID:</span>
                        <span className="font-mono text-ink font-semibold select-all">
                          {selectedConnection.accountId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted font-medium">Confirmed Role ARN:</span>
                        <span className="font-mono text-ink font-semibold select-all truncate max-w-xs sm:max-w-md">
                          {selectedConnection.roleArn}
                        </span>
                      </div>
                    </div>

                    {/* Sync resources banner if executed */}
                    {syncResult && (
                      <Alert variant="success" title="Resource Synchronization Complete">
                        Saved {syncResult.instancesSaved} EC2 instances and {syncResult.volumesSaved} EBS volumes to CloudWise database.
                      </Alert>
                    )}

                    {syncError && (
                      <Alert variant="error" onClose={() => setSyncError(null)}>
                        {syncError}
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        isLoading={isSyncing}
                        disabled={isSyncing}
                        onClick={handleSyncResources}
                        leftIcon={<RefreshCw size={16} />}
                        className="w-full sm:w-auto"
                      >
                        Sync resources now
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={() => navigate('/app/overview')}
                        rightIcon={<ArrowRight size={18} />}
                        className="w-full sm:w-auto"
                      >
                        Go to Overview
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
