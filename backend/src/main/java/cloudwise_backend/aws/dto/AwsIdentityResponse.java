
package cloudwise_backend.aws.dto;

public record AwsIdentityResponse(
        String accountId,
        String userId,
        String arn,
        String status
) {
}
