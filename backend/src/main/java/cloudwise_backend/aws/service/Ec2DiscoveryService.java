
package cloudwise_backend.aws.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import cloudwise_backend.aws.dto.Ec2InstanceResponse;

import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.ec2.model.DescribeInstancesRequest;
import software.amazon.awssdk.services.ec2.model.DescribeInstancesResponse;
import software.amazon.awssdk.services.ec2.model.Instance;
import software.amazon.awssdk.services.ec2.model.Reservation;
import software.amazon.awssdk.services.ec2.model.Tag;

@Service
public class Ec2DiscoveryService {

    private final CustomerAwsCredentialsService credentialsService;

    @Value("${cloudwise.aws.region:ap-south-1}")
    private String awsRegion;

    public Ec2DiscoveryService(
            CustomerAwsCredentialsService credentialsService) {
        this.credentialsService = credentialsService;
    }

    public List<Ec2InstanceResponse> getInstances(
            Long connectionId,
            String userEmail) {

        // 1. Obtain credentials for the authenticated user's AWS connection
        AwsCredentialsProvider credentialsProvider =
                credentialsService.getCredentials(connectionId, userEmail);

        // 2. Create an EC2 client using customer credentials
        try (Ec2Client ec2Client = Ec2Client.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(credentialsProvider)
                .build()) {

            // 3. Use pagination to retrieve every instance
            DescribeInstancesRequest request =
                    DescribeInstancesRequest.builder().build();

            List<Ec2InstanceResponse> instances = new ArrayList<>();

            for (DescribeInstancesResponse page :
                    ec2Client.describeInstancesPaginator(request)) {

                for (Reservation reservation : page.reservations()) {
                    for (Instance instance : reservation.instances()) {
                        instances.add(mapToResponse(instance));
                    }
                }
            }

            return instances;
        }
    }

    private Ec2InstanceResponse mapToResponse(Instance instance) {

        String name = instance.tags() == null
                ? null
                : instance.tags().stream()
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
