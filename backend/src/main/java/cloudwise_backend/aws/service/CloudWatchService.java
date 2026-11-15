
package cloudwise_backend.aws.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import cloudwise_backend.aws.dto.CloudWatchMetricResponse;
import software.amazon.awssdk.services.cloudwatch.CloudWatchClient;
import software.amazon.awssdk.services.cloudwatch.model.Dimension;
import software.amazon.awssdk.services.cloudwatch.model.GetMetricStatisticsRequest;
import software.amazon.awssdk.services.cloudwatch.model.GetMetricStatisticsResponse;
import software.amazon.awssdk.services.cloudwatch.model.Datapoint;
import software.amazon.awssdk.services.cloudwatch.model.StandardUnit;

@Service
public class CloudWatchService {

    private final CloudWatchClient cloudWatchClient;

    public CloudWatchService(CloudWatchClient cloudWatchClient) {
        this.cloudWatchClient = cloudWatchClient;
    }

    public List<CloudWatchMetricResponse> getCpuUtilization(
            String instanceId,
            Instant startTime,
            Instant endTime
    ) {

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
                                software.amazon.awssdk.services.cloudwatch.model.Statistic.AVERAGE,
                                software.amazon.awssdk.services.cloudwatch.model.Statistic.MAXIMUM
                        )
                        .unit(StandardUnit.PERCENT)
                        .build();

        GetMetricStatisticsResponse response =
                cloudWatchClient.getMetricStatistics(request);

        List<CloudWatchMetricResponse> metrics = new ArrayList<>();

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

        metrics.sort((a, b) ->
                a.timestamp().compareTo(b.timestamp())
        );

        return metrics;
    }
}
