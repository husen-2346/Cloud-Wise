package cloudwise_backend.aws.dto;

public record Ec2InstanceResponse(
        String instanceId,
        String instanceType,
        String state,
        String name,
        String availabilityZone,
        String publicIpAddress,
        String privateIpAddress,
        String launchTime
) {
}