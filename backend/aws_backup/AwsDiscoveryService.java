
package cloudwise_backend.aws;

import java.util.List;

import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.ec2.model.DescribeInstancesResponse;
import software.amazon.awssdk.services.ec2.model.Instance;
import software.amazon.awssdk.services.ec2.model.DescribeVolumesResponse;
import software.amazon.awssdk.services.ec2.model.Volume;
import software.amazon.awssdk.services.ec2.model.DescribeVolumesResponse;
import software.amazon.awssdk.services.ec2.model.Volume;

@Service
public class AwsDiscoveryService {

    private final Ec2Client ec2Client;

    public AwsDiscoveryService(Ec2Client ec2Client) {
        this.ec2Client = ec2Client;
    }

    public List<Ec2InstanceDto> discoverInstances() {

        DescribeInstancesResponse response =
                ec2Client.describeInstances();

        return response.reservations()
                .stream()
                .flatMap(reservation ->
                        reservation.instances().stream())
                .map(this::toDto)
                .toList();
    }

    private Ec2InstanceDto toDto(Instance instance) {
        return new Ec2InstanceDto(
                instance.instanceId(),
                instance.state().nameAsString(),
                instance.instanceTypeAsString()
        );
    }

    public record Ec2InstanceDto(
            String instanceId,
            String state,
            String instanceType
    ) {}
    

public List<EbsVolumeDto> discoverVolumes() {

    DescribeVolumesResponse response =
            ec2Client.describeVolumes();

    return response.volumes()
            .stream()
            .map(this::toVolumeDto)
            .toList();
}

private EbsVolumeDto toVolumeDto(Volume volume) {
    return new EbsVolumeDto(
            volume.volumeId(),
            volume.size(),
            volume.stateAsString(),
            volume.volumeTypeAsString()
    );
}

public record EbsVolumeDto(
        String volumeId,
        Integer sizeGiB,
        String state,
        String volumeType
) {}


}

