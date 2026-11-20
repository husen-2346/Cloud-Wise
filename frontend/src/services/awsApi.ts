import { authenticatedFetch } from './authApi';

export interface CustomerAwsConnectionRequest {
  roleArn: string;
}

export interface CustomerAwsConnectionInitiationResponse {
  connectionId: number;
  accountId?: string | null;
  roleArn: string;
  externalId: string;
  status: string;
}

export interface CustomerAwsConnectionResponse {
  accountId: string;
  arn: string;
  status: string;
}

export interface Ec2InstanceResponse {
  instanceId: string;
  instanceType: string;
  state: string;
  name: string | null;
  availabilityZone: string;
  publicIpAddress: string | null;
  privateIpAddress: string | null;
  launchTime: string;
}

export interface EbsVolumeResponse {
  volumeId: string;
  sizeGiB: number;
  volumeType: string;
  state: string;
  availabilityZone: string;
  attachedInstanceIds: string[];
  encrypted: boolean;
  createTime: string;
}

// Backward-compatible type aliases for ConnectionDashboard.tsx
export type Ec2Instance = Ec2InstanceResponse;
export type EbsVolume = EbsVolumeResponse;

export interface CloudWatchMetricResponse {
  instanceId: string;
  metricName: string;
  unit: string;
  timestamp: string;
  average: number | null;
  maximum: number | null;
}

export interface CostExplorerResponse {
  date: string;
  service: string;
  amount: number;
  unit: string;
}

export interface ResourceSyncResult {
  connectionId: number;
  instancesSaved: number;
  volumesSaved: number;
  status: string;
}

export interface MetricSyncResult {
  connectionId: number;
  instanceId: string;
  datapointsFetched: number;
  statisticRecordsProcessed: number;
  status: string;
}

export interface CostSyncResult {
  connectionId: number;
  costRecordsProcessed: number;
  status: string;
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    let errorDetail = '';
    try {
      if (isJson) {
        const errorJson = await response.json();
        errorDetail = errorJson.message || errorJson.error || JSON.stringify(errorJson);
      } else {
        errorDetail = await response.text();
      }
    } catch {
      // Keep empty if unparseable
    }

    throw new Error(
      errorDetail || `AWS API request failed with status ${response.status}`,
    );
  }

  if (isJson) {
    return (await response.json()) as T;
  }
  return null as unknown as T;
}

/**
 * Step 1 of AWS wizard: initiate connection with Customer IAM role ARN.
 */
export async function initiateConnection(
  token: string,
  roleArn: string,
): Promise<CustomerAwsConnectionInitiationResponse> {
  const response = await fetch('/api/aws/connections/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ roleArn }),
  });

  return handleApiResponse<CustomerAwsConnectionInitiationResponse>(response);
}

/**
 * Step 3 of AWS wizard: verify connection while in PENDING status.
 */
export async function verifyConnection(
  token: string,
  connectionId: number,
): Promise<CustomerAwsConnectionResponse> {
  const response = await authenticatedFetch(
    `/api/aws/connections/${connectionId}/verify`,
    token,
  );

  return handleApiResponse<CustomerAwsConnectionResponse>(response);
}

/**
 * Discover EC2 instances for connection (or connection-scoped when connectionId is passed).
 */
export async function fetchEc2Instances(
  token: string,
  connectionId?: number,
): Promise<Ec2InstanceResponse[]> {
  const path =
    connectionId !== undefined
      ? `/api/aws/connections/${connectionId}/instances`
      : '/api/aws/instances';

  const response = await authenticatedFetch(path, token);
  return handleApiResponse<Ec2InstanceResponse[]>(response);
}

/**
 * Discover EBS volumes for connection (or connection-scoped when connectionId is passed).
 */
export async function fetchEbsVolumes(
  token: string,
  connectionId?: number,
): Promise<EbsVolumeResponse[]> {
  const path =
    connectionId !== undefined
      ? `/api/aws/connections/${connectionId}/volumes`
      : '/api/aws/volumes';

  const response = await authenticatedFetch(path, token);
  return handleApiResponse<EbsVolumeResponse[]>(response);
}

/**
 * Fetch CPU utilization metrics for a specific instance within a time range.
 */
export async function fetchCpuMetrics(
  token: string,
  connectionId: number,
  instanceId: string,
  startTime: string,
  endTime: string,
): Promise<CloudWatchMetricResponse[]> {
  const params = new URLSearchParams({
    instanceId,
    startTime,
    endTime,
  });

  const response = await authenticatedFetch(
    `/api/aws/connections/${connectionId}/cloudwatch/cpu?${params.toString()}`,
    token,
  );

  return handleApiResponse<CloudWatchMetricResponse[]>(response);
}

// In-memory cache for Cost Explorer results: 10 minutes per (connectionId, startDate, endDate)
interface CostCacheEntry {
  timestamp: number;
  data: CostExplorerResponse[];
}
const costExplorerCache = new Map<string, CostCacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Fetch service costs from Cost Explorer.
 * Caches responses in memory for 10 minutes.
 */
export async function fetchServiceCosts(
  token: string,
  connectionId: number,
  startDate: string,
  endDate: string,
  forceRefresh: boolean = false,
): Promise<CostExplorerResponse[]> {
  const cacheKey = `${connectionId}:${startDate}:${endDate}`;

  if (!forceRefresh) {
    const cached = costExplorerCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await authenticatedFetch(
    `/api/aws/connections/${connectionId}/costs/services?${params.toString()}`,
    token,
  );

  const data = await handleApiResponse<CostExplorerResponse[]>(response);
  costExplorerCache.set(cacheKey, { timestamp: Date.now(), data });
  return data;
}

/**
 * Sync resources (EC2 and EBS) to database on backend.
 */
export async function syncResources(
  token: string,
  connectionId: number,
): Promise<ResourceSyncResult> {
  const response = await fetch(`/api/aws/connections/${connectionId}/sync/resources`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleApiResponse<ResourceSyncResult>(response);
}

/**
 * Sync costs to database on backend.
 */
export async function syncCosts(
  token: string,
  connectionId: number,
  startDate: string,
  endDate: string,
): Promise<CostSyncResult> {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await fetch(
    `/api/aws/connections/${connectionId}/sync/costs?${params.toString()}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return handleApiResponse<CostSyncResult>(response);
}

/**
 * Sync CPU metrics to database on backend.
 */
export async function syncCpuMetrics(
  token: string,
  connectionId: number,
  instanceId: string,
  startTime: string,
  endTime: string,
): Promise<MetricSyncResult> {
  const params = new URLSearchParams({ instanceId, startTime, endTime });
  const response = await fetch(
    `/api/aws/connections/${connectionId}/sync/cloudwatch/cpu?${params.toString()}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return handleApiResponse<MetricSyncResult>(response);
}
