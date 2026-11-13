
package cloudwise_backend.aws.service;

import java.util.List;

import org.springframework.stereotype.Service;

import cloudwise_backend.aws.dto.Ec2InstanceResponse;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.ec2.model.DescribeInstancesRequest;
import software.amazon.awssdk.services.ec2.model.DescribeInstancesResponse;
import software.amazon.awssdk.services.ec2.model.Instance;
import software.amazon.awssdk.services.ec2.model.Reservation;
import software.amazon.awssdk.services.ec2.model.Tag;

@Service
public class Ec2DiscoveryService {

    private final Ec2Client ec2Client;

    public Ec2DiscoveryService(Ec2Client ec2Client) {
        this.ec2Client = ec2Client;
    }

    public List<Ec2InstanceResponse> getInstances() {

        DescribeInstancesResponse response =
                ec2Client.describeInstances(
                        DescribeInstancesRequest.builder().build()
                );

        return response.reservations()
                .stream()
                .map(Reservation::instances)
                .flatMap(List::stream)
                .map(this::mapToResponse)
                .toList();
    }

    private Ec2InstanceResponse mapToResponse(Instance instance) {

        String name = instance.tags()
                .stream()
                .filter(tag -> "Name".equals(tag.key()))
                .map(Tag::value)
                .findFirst()
                .orElse(null);

        return new Ec2InstanceResponse(
                instance.instanceId(),
                instance.instanceTypeAsString(),
                instance.state() != null
                        ? instance.state().nameAsString()
                        : "UNKNOWN",
                name,
                instance.placement() != null
                        ? instance.placement().availabilityZone()
                        : null,
                instance.publicIpAddress(),
                instance.privateIpAddress(),
                instance.launchTime() != null
                        ? instance.launchTime().toString()
                        : null
        );
    }
}
