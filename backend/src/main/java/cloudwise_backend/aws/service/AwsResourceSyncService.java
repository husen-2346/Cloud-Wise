
package cloudwise_backend.aws.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import cloudwise_backend.aws.dto.Ec2InstanceResponse;
import cloudwise_backend.aws.dto.EbsVolumeResponse;

@Service
public class AwsResourceSyncService {

    private final Ec2DiscoveryService ec2DiscoveryService;
    private final EbsDiscoveryService ebsDiscoveryService;
    private final AwsDataPersistenceService persistenceService;

    @Value("${cloudwise.aws.region:ap-south-1}")
    private String awsRegion;

    public AwsResourceSyncService(
            Ec2DiscoveryService ec2DiscoveryService,
            EbsDiscoveryService ebsDiscoveryService,
            AwsDataPersistenceService persistenceService) {

        this.ec2DiscoveryService = ec2DiscoveryService;
        this.ebsDiscoveryService = ebsDiscoveryService;
        this.persistenceService = persistenceService;
    }

    public ResourceSyncResult syncResources(
            Long connectionId,
            String userEmail) {

        // Discover EC2 instances from the customer's AWS account
        List<Ec2InstanceResponse> instances =
                ec2DiscoveryService.getInstances(connectionId, userEmail);

        // Discover EBS volumes from the customer's AWS account
        List<EbsVolumeResponse> volumes =
                ebsDiscoveryService.getVolumes(connectionId, userEmail);

        // Persist normalized EC2 and EBS records
        persistenceService.saveEc2Instances(
                connectionId,
                userEmail,
                instances,
                awsRegion
        );

        persistenceService.saveEbsVolumes(
                connectionId,
                userEmail,
                volumes,
                awsRegion
        );

        return new ResourceSyncResult(
                connectionId,
                instances.size(),
                volumes.size(),
                "SUCCESS"
        );
    }

    public record ResourceSyncResult(
            Long connectionId,
            int instancesSaved,
            int volumesSaved,
            String status
    ) {
    }
}
