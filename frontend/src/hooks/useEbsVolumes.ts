import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchEbsVolumes, type EbsVolumeResponse } from '../services/awsApi';

export function useEbsVolumes(connectionId: number | null) {
  const { token } = useAuth();
  const [volumes, setVolumes] = useState<EbsVolumeResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(connectionId && token));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!token || !connectionId) {
      setVolumes([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchEbsVolumes(token, connectionId);
      setVolumes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch EBS volumes',
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
          setVolumes([]);
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

    fetchEbsVolumes(token, connectionId)
      .then((data) => {
        if (!cancelled) {
          setVolumes(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to fetch EBS volumes',
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

  return { volumes, isLoading, error, refetch };
}
