
import { authenticatedFetch } from './authApi';

export interface Ec2Instance {
  instanceId: string;
  state: string;
  instanceType: string;
}

export interface EbsVolume {
  volumeId: string;
  sizeGiB: number;
  state: string;
  volumeType: string;
}

async function readAwsResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(
      message || `AWS request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchEc2Instances(
  token: string,
): Promise<Ec2Instance[]> {
  const response = await authenticatedFetch('/api/aws/instances', token);
  return readAwsResponse<Ec2Instance[]>(response);
}

export async function fetchEbsVolumes(
  token: string,
): Promise<EbsVolume[]> {
  const response = await authenticatedFetch('/api/aws/volumes', token);
  return readAwsResponse<EbsVolume[]>(response);
}
