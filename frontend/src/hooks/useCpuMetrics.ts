import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchCpuMetrics, type Ec2InstanceResponse, type CloudWatchMetricResponse } from '../services/awsApi';

export interface CpuChartDataPoint {
  time: string;
  timestamp: number;
  cpu: number | null;
}

export function useCpuMetrics(
  connectionId: number | null,
  runningInstances: Ec2InstanceResponse[],
  timeRange: '24h' | '7d',
  selectedInstanceId: string,
) {
  const { token } = useAuth();
  const [chartData, setChartData] = useState<CpuChartDataPoint[]>([]);
  const [rawPointsCount, setRawPointsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndProcess = useCallback(async () => {
    if (!token || !connectionId || runningInstances.length === 0) {
      setChartData([]);
      setRawPointsCount(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const now = new Date();
    const durationHours = timeRange === '24h' ? 24 : 7 * 24;
    const bucketMinutes = timeRange === '24h' ? 30 : 3 * 60;
    const bucketMs = bucketMinutes * 60 * 1000;
    const totalBuckets = Math.ceil((durationHours * 60) / bucketMinutes);

    const startTime = new Date(now.getTime() - durationHours * 60 * 60 * 1000);
    const startIso = startTime.toISOString();
    const endIso = now.toISOString();

    const targetInstances =
      selectedInstanceId === 'all'
        ? runningInstances.slice(0, 5)
        : runningInstances.filter((i) => i.instanceId === selectedInstanceId);

    if (targetInstances.length === 0) {
      setChartData([]);
      setRawPointsCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const results = await Promise.all(
        targetInstances.map((inst) =>
          fetchCpuMetrics(token, connectionId, inst.instanceId, startIso, endIso).catch(() => []),
        ),
      );

      let totalPoints = 0;
      const bucketValues: number[][] = Array.from({ length: totalBuckets }, () => []);

      results.forEach((metricList: CloudWatchMetricResponse[]) => {
        totalPoints += metricList.length;

        metricList.forEach((m) => {
          if (m.average !== null && m.average !== undefined) {
            const pointTime = new Date(m.timestamp).getTime();
            const offsetMs = pointTime - startTime.getTime();
            if (offsetMs >= 0) {
              const bucketIdx = Math.min(
                Math.floor(offsetMs / bucketMs),
                totalBuckets - 1,
              );
              bucketValues[bucketIdx].push(m.average);
            }
          }
        });
      });

      setRawPointsCount(totalPoints);

      const points: CpuChartDataPoint[] = [];

      for (let i = 0; i < totalBuckets; i++) {
        const bucketTime = new Date(startTime.getTime() + i * bucketMs);
        const timeLabel =
          timeRange === '24h'
            ? bucketTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            : bucketTime.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

        const values = bucketValues[i];
        if (values.length > 0) {
          const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
          points.push({
            time: timeLabel,
            timestamp: bucketTime.getTime(),
            cpu: Number(avg.toFixed(2)),
          });
        } else {
          points.push({
            time: timeLabel,
            timestamp: bucketTime.getTime(),
            cpu: null,
          });
        }
      }

      setChartData(points);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch CPU utilization metrics',
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, connectionId, runningInstances, timeRange, selectedInstanceId]);

  useEffect(() => {
    let cancelled = false;

    if (!token || !connectionId || runningInstances.length === 0) {
      queueMicrotask(() => {
        if (!cancelled) {
          setChartData([]);
          setRawPointsCount(0);
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

    const now = new Date();
    const durationHours = timeRange === '24h' ? 24 : 7 * 24;
    const bucketMinutes = timeRange === '24h' ? 30 : 3 * 60;
    const bucketMs = bucketMinutes * 60 * 1000;
    const totalBuckets = Math.ceil((durationHours * 60) / bucketMinutes);

    const startTime = new Date(now.getTime() - durationHours * 60 * 60 * 1000);
    const startIso = startTime.toISOString();
    const endIso = now.toISOString();

    const targetInstances =
      selectedInstanceId === 'all'
        ? runningInstances.slice(0, 5)
        : runningInstances.filter((i) => i.instanceId === selectedInstanceId);

    if (targetInstances.length === 0) {
      queueMicrotask(() => {
        if (!cancelled) {
          setChartData([]);
          setRawPointsCount(0);
          setIsLoading(false);
        }
      });
      return;
    }

    Promise.all(
      targetInstances.map((inst) =>
        fetchCpuMetrics(token, connectionId, inst.instanceId, startIso, endIso).catch(() => []),
      ),
    )
      .then((results) => {
        if (cancelled) return;

        let totalPoints = 0;
        const bucketValues: number[][] = Array.from({ length: totalBuckets }, () => []);

        results.forEach((metricList: CloudWatchMetricResponse[]) => {
          totalPoints += metricList.length;

          metricList.forEach((m) => {
            if (m.average !== null && m.average !== undefined) {
              const pointTime = new Date(m.timestamp).getTime();
              const offsetMs = pointTime - startTime.getTime();
              if (offsetMs >= 0) {
                const bucketIdx = Math.min(
                  Math.floor(offsetMs / bucketMs),
                  totalBuckets - 1,
                );
                bucketValues[bucketIdx].push(m.average);
              }
            }
          });
        });

        setRawPointsCount(totalPoints);

        const points: CpuChartDataPoint[] = [];

        for (let i = 0; i < totalBuckets; i++) {
          const bucketTime = new Date(startTime.getTime() + i * bucketMs);
          const timeLabel =
            timeRange === '24h'
              ? bucketTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              : bucketTime.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

          const values = bucketValues[i];
          if (values.length > 0) {
            const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
            points.push({
              time: timeLabel,
              timestamp: bucketTime.getTime(),
              cpu: Number(avg.toFixed(2)),
            });
          } else {
            points.push({
              time: timeLabel,
              timestamp: bucketTime.getTime(),
              cpu: null,
            });
          }
        }

        setChartData(points);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to fetch CPU utilization metrics',
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
  }, [token, connectionId, runningInstances, timeRange, selectedInstanceId]);

  return {
    chartData,
    rawPointsCount,
    isLoading,
    error,
    refetch: fetchAndProcess,
  };
}
