package cloudwise_backend.aws.dto;

public record CustomerAwsConnectionResponse(
        String accountId,
        String arn,
        String status
) {}