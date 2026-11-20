import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchServiceCosts, type CostExplorerResponse } from '../services/awsApi';

export function useServiceCosts(
  connectionId: number | null,
  startDate: string,
  endDate: string,
) {
  const { token } = useAuth();
  const [costs, setCosts] = useState<CostExplorerResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(
    Boolean(connectionId && token && startDate && endDate),
  );
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (forceRefresh = true) => {
      if (!token || !connectionId || !startDate || !endDate) {
        setCosts([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchServiceCosts(
          token,
          connectionId,
          startDate,
          endDate,
          forceRefresh,
        );
        setCosts(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch Cost Explorer service costs',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [token, connectionId, startDate, endDate],
  );

  useEffect(() => {
    let cancelled = false;

    if (!token || !connectionId || !startDate || !endDate) {
      queueMicrotask(() => {
        if (!cancelled) {
          setCosts([]);
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

    fetchServiceCosts(token, connectionId, startDate, endDate, false)
      .then((data) => {
        if (!cancelled) {
          setCosts(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to fetch Cost Explorer service costs',
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
  }, [token, connectionId, startDate, endDate]);

  return { costs, isLoading, error, refetch };
}
