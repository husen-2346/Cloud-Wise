
package cloudwise_backend.aws.service;

import cloudwise_backend.auth.entity.User;
import cloudwise_backend.auth.repository.UserRepository;

import cloudwise_backend.aws.dto.Ec2InstanceResponse;
import cloudwise_backend.aws.dto.EbsVolumeResponse;
import cloudwise_backend.aws.dto.CloudWatchMetricResponse;
import cloudwise_backend.aws.dto.CostExplorerResponse;

import cloudwise_backend.aws.entity.AwsConnection;
import cloudwise_backend.aws.entity.AwsResource;
import cloudwise_backend.aws.entity.AwsCostRecord;
import cloudwise_backend.aws.entity.AwsMetricRecord;

import cloudwise_backend.aws.repository.AwsConnectionRepository;
import cloudwise_backend.aws.repository.AwsResourceRepository;
import cloudwise_backend.aws.repository.AwsCostRecordRepository;
import cloudwise_backend.aws.repository.AwsMetricRecordRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class AwsDataPersistenceService {

    private final UserRepository userRepository;
    private final AwsConnectionRepository connectionRepository;
    private final AwsResourceRepository resourceRepository;
    private final AwsCostRecordRepository costRepository;
    private final AwsMetricRecordRepository metricRepository;

    public AwsDataPersistenceService(
            UserRepository userRepository,
            AwsConnectionRepository connectionRepository,
            AwsResourceRepository resourceRepository,
            AwsCostRecordRepository costRepository,
            AwsMetricRecordRepository metricRepository) {

        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
        this.resourceRepository = resourceRepository;
        this.costRepository = costRepository;
        this.metricRepository = metricRepository;
    }

    private AwsConnection getConnection(
            Long connectionId,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        return connectionRepository
                .findByIdAndUserId(connectionId, user.getId())
                .filter(connection ->
                        "CONNECTED".equals(connection.getStatus()))
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Connected AWS account not found"));
    }

    @Transactional
    public void saveEc2Instances(
            Long connectionId,
            String userEmail,
            List<Ec2InstanceResponse> instances,
            String region) {

        AwsConnection connection =
                getConnection(connectionId, userEmail);

        for (Ec2InstanceResponse instance : instances) {

            AwsResource resource = findOrCreateResource(
                    connection,
                    instance.instanceId(),
                    "EC2",
                    region
            );

            resource.setResourceName(instance.name());
            resource.setState(instance.state());
            resource.setAvailabilityZone(instance.availabilityZone());

            resourceRepository.save(resource);
        }
    }

    @Transactional
    public void saveEbsVolumes(
            Long connectionId,
            String userEmail,
            List<EbsVolumeResponse> volumes,
            String region) {

        AwsConnection connection =
                getConnection(connectionId, userEmail);

        for (EbsVolumeResponse volume : volumes) {

            AwsResource resource = findOrCreateResource(
                    connection,
                    volume.volumeId(),
                    "EBS",
                    region
            );

            resource.setResourceName(volume.volumeId());
            resource.setState(volume.state());
            resource.setAvailabilityZone(volume.availabilityZone());

            resourceRepository.save(resource);
        }
    }

    @Transactional
    public void saveCosts(
            Long connectionId,
            String userEmail,
            List<CostExplorerResponse> costs) {

        AwsConnection connection =
                getConnection(connectionId, userEmail);

        for (CostExplorerResponse cost : costs) {

            String region = "GLOBAL";

            AwsCostRecord record = costRepository
                    .findByConnectionIdAndServiceAndCostDateAndRegion(
                            connectionId,
                            cost.service(),
                            cost.date(),
                            region
                    )
                    .orElseGet(() -> {
                        AwsCostRecord newRecord = new AwsCostRecord();
                        newRecord.setConnection(connection);
                        newRecord.setCostDate(cost.date());
                        newRecord.setService(cost.service());
                        newRecord.setRegion(region);
                        return newRecord;
                    });

            record.setAmount(cost.amount());
            record.setCurrency(cost.unit());

            costRepository.save(record);
        }
    }

    @Transactional
    public void saveCloudWatchMetrics(
            Long connectionId,
            String userEmail,
            List<CloudWatchMetricResponse> metrics,
            String region) {

        AwsConnection connection =
                getConnection(connectionId, userEmail);

        for (CloudWatchMetricResponse metric : metrics) {

            if (metric.average() != null) {
                saveMetric(
                        connection,
                        metric,
                        "AVERAGE",
                        metric.average(),
                        region
                );
            }

            if (metric.maximum() != null) {
                saveMetric(
                        connection,
                        metric,
                        "MAXIMUM",
                        metric.maximum(),
                        region
                );
            }
        }
    }

    private void saveMetric(
            AwsConnection connection,
            CloudWatchMetricResponse metric,
            String statistic,
            Double value,
            String region) {

        AwsMetricRecord record = metricRepository
                .findAllByConnectionIdAndResourceIdAndMetricNameAndTimestampBetween(
                        connection.getId(),
                        metric.instanceId(),
                        metric.metricName(),
                        metric.timestamp(),
                        metric.timestamp()
                )
                .stream()
                .filter(existing ->
                        statistic.equals(existing.getStatistic()))
                .findFirst()
                .orElseGet(() -> {
                    AwsMetricRecord newRecord = new AwsMetricRecord();
                    newRecord.setConnection(connection);
                    newRecord.setResourceId(metric.instanceId());
                    newRecord.setMetricName(metric.metricName());
                    newRecord.setStatistic(statistic);
                    newRecord.setTimestamp(metric.timestamp());
                    newRecord.setRegion(region);
                    return newRecord;
                });

        record.setValue(value);
        record.setUnit(metric.unit());

        metricRepository.save(record);
    }

    private AwsResource findOrCreateResource(
            AwsConnection connection,
            String resourceId,
            String resourceType,
            String region) {

        return resourceRepository
                .findByConnectionIdAndResourceIdAndResourceTypeAndRegion(
                        connection.getId(),
                        resourceId,
                        resourceType,
                        region
                )
                .orElseGet(() -> {
                    AwsResource resource = new AwsResource();
                    resource.setConnection(connection);
                    resource.setResourceId(resourceId);
                    resource.setResourceType(resourceType);
                    resource.setRegion(region);
                    return resource;
                });
    }
}
