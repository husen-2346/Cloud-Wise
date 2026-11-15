
package cloudwise_backend.aws.service;

import cloudwise_backend.aws.dto.Ec2InstanceResponse;
import cloudwise_backend.aws.dto.EbsVolumeResponse;
import cloudwise_backend.aws.entity.AwsConnection;
import cloudwise_backend.aws.entity.AwsResource;
import cloudwise_backend.aws.repository.AwsConnectionRepository;
import cloudwise_backend.aws.repository.AwsResourceRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AwsDataPersistenceService {

    private final AwsConnectionRepository connectionRepository;
    private final AwsResourceRepository resourceRepository;

    public AwsDataPersistenceService(
            AwsConnectionRepository connectionRepository,
            AwsResourceRepository resourceRepository) {
        this.connectionRepository = connectionRepository;
        this.resourceRepository = resourceRepository;
    }

    @Transactional
    public void saveEc2Instances(
            Long connectionId,
            List<Ec2InstanceResponse> instances,
            String region) {

        AwsConnection connection = getConnection(connectionId);

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
            List<EbsVolumeResponse> volumes,
            String region) {

        AwsConnection connection = getConnection(connectionId);

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

    private AwsConnection getConnection(Long connectionId) {
        return connectionRepository.findById(connectionId)
                .filter(connection ->
                        "CONNECTED".equals(connection.getStatus()))
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Connected AWS account not found"));
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
