
package cloudwise_backend.aws.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import cloudwise_backend.aws.dto.CloudWatchMetricResponse;
import cloudwise_backend.aws.dto.CostExplorerResponse;

@Service
public class AwsTelemetrySyncService {

    private final CloudWatchService cloudWatchService;
    private final CostExplorerService costExplorerService;
    private final AwsDataPersistenceService persistenceService;

    @Value("${cloudwise.aws.region:ap-south-1}")
    private String awsRegion;

    public AwsTelemetrySyncService(
            CloudWatchService cloudWatchService,
            CostExplorerService costExplorerService,
            AwsDataPersistenceService persistenceService) {

        this.cloudWatchService = cloudWatchService;
        this.costExplorerService = costExplorerService;
        this.persistenceService = persistenceService;
    }

    public MetricSyncResult syncCpuMetrics(
            Long connectionId,
            String userEmail,
            String instanceId,
            Instant startTime,
            Instant endTime) {

        List<CloudWatchMetricResponse> metrics =
                cloudWatchService.getCpuUtilization(
                        connectionId,
                        userEmail,
                        instanceId,
                        startTime,
                        endTime
                );

        persistenceService.saveCloudWatchMetrics(
                connectionId,
                userEmail,
                metrics,
                awsRegion
        );

        return new MetricSyncResult(
                connectionId,
                instanceId,
                metrics.size(),
                metrics.size() * 2,
                "SUCCESS"
        );
    }

    public CostSyncResult syncCosts(
            Long connectionId,
            String userEmail,
            LocalDate startDate,
            LocalDate endDate) {

        List<CostExplorerResponse> costs =
                costExplorerService.getServiceCosts(
                        connectionId,
                        userEmail,
                        startDate,
                        endDate
                );

        persistenceService.saveCosts(
                connectionId,
                userEmail,
                costs
        );

        return new CostSyncResult(
                connectionId,
                costs.size(),
                "SUCCESS"
        );
    }

    public record MetricSyncResult(
            Long connectionId,
            String instanceId,
            int datapointsFetched,
            int statisticRecordsProcessed,
            String status
    ) {}

    public record CostSyncResult(
            Long connectionId,
            int costRecordsProcessed,
            String status
    ) {}
}
