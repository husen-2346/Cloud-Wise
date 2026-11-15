
package cloudwise_backend.aws.dto;

import java.time.Instant;

public record CloudWatchMetricResponse(
        String instanceId,
        String metricName,
        String unit,
        Instant timestamp,
        Double average,
        Double maximum
) {
}
