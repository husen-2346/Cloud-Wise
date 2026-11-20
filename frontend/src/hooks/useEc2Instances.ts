import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchEc2Instances, type Ec2InstanceResponse } from '../services/awsApi';

export function useEc2Instances(connectionId: number | null) {
  const { token } = useAuth();
  const [instances, setInstances] = useState<Ec2InstanceResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(connectionId && token));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!token || !connectionId) {
      setInstances([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchEc2Instances(token, connectionId);
      setInstances(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch EC2 instances',
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, connectionId]);

  useEffect(() => {
    let cancelled = false;

    if (!token || !connectionId) {
      queueMicrotask(() => {
        if (!cancelled) {
          setInstances([]);
          setIsLoading(false);
          setError(null);
        }
      });
      return;
    }

    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoading(true);
        setError(null);
      }
    });

    fetchEc2Instances(token, connectionId)
      .then((data) => {
        if (!cancelled) {
          setInstances(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to fetch EC2 instances',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, connectionId]);

  return { instances, isLoading, error, refetch };
}
