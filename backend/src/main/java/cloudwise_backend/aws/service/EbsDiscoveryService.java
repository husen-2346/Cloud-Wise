
package cloudwise_backend.aws.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import cloudwise_backend.aws.dto.EbsVolumeResponse;

import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.ec2.model.DescribeVolumesRequest;
import software.amazon.awssdk.services.ec2.model.DescribeVolumesResponse;
import software.amazon.awssdk.services.ec2.model.Volume;
import software.amazon.awssdk.services.ec2.model.VolumeAttachment;

@Service
public class EbsDiscoveryService {

    private final CustomerAwsCredentialsService credentialsService;

    @Value("${cloudwise.aws.region:ap-south-1}")
    private String awsRegion;

    public EbsDiscoveryService(
            CustomerAwsCredentialsService credentialsService) {
        this.credentialsService = credentialsService;
    }

    public List<EbsVolumeResponse> getVolumes(
            Long connectionId,
            String userEmail) {

        // 1. Obtain credentials for the authenticated user's AWS account
        AwsCredentialsProvider credentialsProvider =
                credentialsService.getCredentials(connectionId, userEmail);

        // 2. Create EC2 client using customer credentials
        try (Ec2Client ec2Client = Ec2Client.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(credentialsProvider)
                .build()) {

            // 3. Retrieve all EBS volumes using pagination
            DescribeVolumesRequest request =
                    DescribeVolumesRequest.builder().build();

            List<EbsVolumeResponse> volumes = new ArrayList<>();

            for (DescribeVolumesResponse page :
                    ec2Client.describeVolumesPaginator(request)) {

                for (Volume volume : page.volumes()) {
                    volumes.add(mapToResponse(volume));
                }
            }

            return volumes;
        }
    }

    private EbsVolumeResponse mapToResponse(Volume volume) {

        List<String> attachedInstanceIds = volume.attachments()
                .stream()
                .map(VolumeAttachment::instanceId)
                .filter(id -> id != null && !id.isBlank())
                .toList();

        return new EbsVolumeResponse(
                volume.volumeId(),
                volume.size(),
                volume.volumeTypeAsString(),
                volume.stateAsString(),
                volume.availabilityZone(),
                attachedInstanceIds,
                Boolean.TRUE.equals(volume.encrypted()),
                volume.createTime() != null
                        ? volume.createTime().toString()
                        : null
        );
    }
}
