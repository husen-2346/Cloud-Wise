
package cloudwise_backend.aws.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import cloudwise_backend.aws.dto.CloudWatchMetricResponse;

import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudwatch.CloudWatchClient;
import software.amazon.awssdk.services.cloudwatch.model.Dimension;
import software.amazon.awssdk.services.cloudwatch.model.GetMetricStatisticsRequest;
import software.amazon.awssdk.services.cloudwatch.model.GetMetricStatisticsResponse;
import software.amazon.awssdk.services.cloudwatch.model.Datapoint;
import software.amazon.awssdk.services.cloudwatch.model.StandardUnit;
import software.amazon.awssdk.services.cloudwatch.model.Statistic;

@Service
public class CloudWatchService {

    private final CustomerAwsCredentialsService credentialsService;

    @Value("${cloudwise.aws.region:ap-south-1}")
    private String awsRegion;

    public CloudWatchService(
            CustomerAwsCredentialsService credentialsService) {
        this.credentialsService = credentialsService;
    }

    public List<CloudWatchMetricResponse> getCpuUtilization(
            Long connectionId,
            String userEmail,
            String instanceId,
            Instant startTime,
            Instant endTime) {

        if (startTime == null || endTime == null
                || !startTime.isBefore(endTime)) {
            throw new IllegalArgumentException(
                    "Start time must be before end time");
        }

        // 1. Obtain credentials for the selected customer account
        AwsCredentialsProvider credentialsProvider =
                credentialsService.getCredentials(
                        connectionId, userEmail);

        // 2. Create a customer-specific CloudWatch client
        try (CloudWatchClient cloudWatchClient =
                CloudWatchClient.builder()
                        .region(Region.of(awsRegion))
                        .credentialsProvider(credentialsProvider)
                        .build()) {

            // 3. Request EC2 CPU utilization metrics
            GetMetricStatisticsRequest request =
                    GetMetricStatisticsRequest.builder()
                            .namespace("AWS/EC2")
                            .metricName("CPUUtilization")
                            .dimensions(
                                    Dimension.builder()
                                            .name("InstanceId")
                                            .value(instanceId)
                                            .build()
                            )
                            .startTime(startTime)
                            .endTime(endTime)
                            .period(300)
                            .statistics(
                                    Statistic.AVERAGE,
                                    Statistic.MAXIMUM
                            )
                            .unit(StandardUnit.PERCENT)
                            .build();

            GetMetricStatisticsResponse response =
                    cloudWatchClient.getMetricStatistics(request);

            // 4. Map AWS datapoints to CloudWise DTO
            List<CloudWatchMetricResponse> metrics =
                    new ArrayList<>();

            for (Datapoint datapoint : response.datapoints()) {

                metrics.add(new CloudWatchMetricResponse(
                        instanceId,
                        "CPUUtilization",
                        "Percent",
                        datapoint.timestamp(),
                        datapoint.average(),
                        datapoint.maximum()
                ));
            }

            // 5. Sort metrics chronologically
            metrics.sort((a, b) ->
                    a.timestamp().compareTo(b.timestamp()));

            return metrics;
        }
    }
}
