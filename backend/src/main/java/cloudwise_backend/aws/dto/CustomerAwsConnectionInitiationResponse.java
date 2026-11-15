package cloudwise_backend.aws.dto;

public record CustomerAwsConnectionInitiationResponse(
        Long connectionId,
        String accountId,
        String roleArn,
        String externalId,
        String status
) {}