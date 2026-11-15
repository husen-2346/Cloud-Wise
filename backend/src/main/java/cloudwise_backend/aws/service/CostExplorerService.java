
package cloudwise_backend.aws.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import cloudwise_backend.aws.dto.CostExplorerResponse;

import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.costexplorer.CostExplorerClient;
import software.amazon.awssdk.services.costexplorer.model.DateInterval;
import software.amazon.awssdk.services.costexplorer.model.Dimension;
import software.amazon.awssdk.services.costexplorer.model.Expression;
import software.amazon.awssdk.services.costexplorer.model.GetCostAndUsageRequest;
import software.amazon.awssdk.services.costexplorer.model.GetCostAndUsageResponse;
import software.amazon.awssdk.services.costexplorer.model.Granularity;
import software.amazon.awssdk.services.costexplorer.model.Group;
import software.amazon.awssdk.services.costexplorer.model.GroupDefinition;
import software.amazon.awssdk.services.costexplorer.model.GroupDefinitionType;
import software.amazon.awssdk.services.costexplorer.model.Metric;
import software.amazon.awssdk.services.costexplorer.model.ResultByTime;

@Service
public class CostExplorerService {

    private final CustomerAwsCredentialsService credentialsService;

    public CostExplorerService(
            CustomerAwsCredentialsService credentialsService) {
        this.credentialsService = credentialsService;
    }

    public List<CostExplorerResponse> getServiceCosts(
            Long connectionId,
            String userEmail,
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null || endDate == null
                || !startDate.isBefore(endDate)) {
            throw new IllegalArgumentException(
                    "Start date must be before end date");
        }

        AwsCredentialsProvider credentials =
                credentialsService.getCredentials(connectionId, userEmail);

        try (CostExplorerClient client = CostExplorerClient.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(credentials)
                .build()) {

            GetCostAndUsageRequest request =
                    GetCostAndUsageRequest.builder()
                            .timePeriod(DateInterval.builder()
                                    .start(startDate.toString())
                                    .end(endDate.toString())
                                    .build())
                            .granularity(Granularity.DAILY)
                            .metrics(Metric.UNBLENDED_COST.toString())
                            .groupBy(GroupDefinition.builder()
                                    .type(GroupDefinitionType.DIMENSION)
                                    .key(Dimension.SERVICE.toString())
                                    .build())
                            .build();

            GetCostAndUsageResponse response =
                    client.getCostAndUsage(request);

            List<CostExplorerResponse> results = new ArrayList<>();

            for (ResultByTime period : response.resultsByTime()) {

                LocalDate date = LocalDate.parse(period.timePeriod().start());

                for (Group group : period.groups()) {

                    String service = group.keys().isEmpty()
                            ? "Unknown"
                            : group.keys().get(0);

                    var metric = group.metrics().get(
                            Metric.UNBLENDED_COST.toString());

                    if (metric != null) {
                        results.add(new CostExplorerResponse(
                                date,
                                service,
                                new BigDecimal(metric.amount()),
                                metric.unit()
                        ));
                    }
                }
            }

            return results;
        }
    }
}
