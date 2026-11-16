
package cloudwise_backend.aws.repository;

import cloudwise_backend.aws.entity.AwsMetricRecord;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface AwsMetricRecordRepository
                extends JpaRepository<AwsMetricRecord, Long> {

        List<AwsMetricRecord> findAllByConnectionIdAndResourceIdAndMetricNameAndTimestampBetween(
                        Long connectionId,
                        String resourceId,
                        String metricName,
                        Instant startTime,
                        Instant endTime);

        List<AwsMetricRecord> findAllByConnectionIdAndTimestampBetween(
                        Long connectionId,
                        Instant startTime,
                        Instant endTime);

        boolean existsByConnectionIdAndResourceIdAndMetricNameAndStatisticAndTimestamp(
                        Long connectionId,
                        String resourceId,
                        String metricName,
                        String statistic,
                        Instant timestamp);

        Optional<AwsMetricRecord> findByConnectionIdAndResourceIdAndMetricNameAndStatisticAndTimestamp(
                        Long connectionId,
                        String resourceId,
                        String metricName,
                        String statistic,
                        Instant timestamp);
}
