
package cloudwise_backend.aws.service;

import cloudwise_backend.auth.entity.User;
import cloudwise_backend.auth.repository.UserRepository;
import cloudwise_backend.aws.dto.CustomerAwsConnectionResponse;
import cloudwise_backend.aws.entity.AwsConnection;
import cloudwise_backend.aws.repository.AwsConnectionRepository;

import org.springframework.stereotype.Service;

import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest;
import software.amazon.awssdk.services.sts.model.AssumeRoleResponse;
import software.amazon.awssdk.services.sts.model.GetCallerIdentityResponse;

@Service
public class CustomerAwsConnectionService {

    private final StsClient platformStsClient;
    private final UserRepository userRepository;
    private final AwsConnectionRepository connectionRepository;

    public CustomerAwsConnectionService(
            StsClient platformStsClient,
            UserRepository userRepository,
            AwsConnectionRepository connectionRepository) {

        this.platformStsClient = platformStsClient;
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
    }

    public CustomerAwsConnectionResponse verify(
            Long connectionId,
            String userEmail) {

        // 1. Identify the authenticated CloudWise user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        // 2. Retrieve only this user's connection
        AwsConnection connection = connectionRepository
                .findByIdAndUserId(connectionId, user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "AWS connection not found"));

        if (!"PENDING".equals(connection.getStatus())) {
            throw new IllegalStateException(
                    "Only pending connections can be verified");
        }

        // 3. Validate the expected customer role ARN format
        String roleArn = connection.getRoleArn();

        if (!roleArn.matches(
                "^arn:aws:iam::\\d{12}:role/CloudWiseCustomerRole$")) {
            throw new IllegalArgumentException(
                    "Invalid CloudWise customer role ARN");
        }

        // 4. Request temporary credentials using the saved External ID
        AssumeRoleRequest assumeRoleRequest = AssumeRoleRequest.builder()
                .roleArn(roleArn)
                .roleSessionName("CloudWiseConnection-" + connectionId)
                .externalId(connection.getExternalId())
                .durationSeconds(3600)
                .build();

        AssumeRoleResponse assumeRoleResponse =
                platformStsClient.assumeRole(assumeRoleRequest);

        var credentials = assumeRoleResponse.credentials();

        // 5. Create a temporary credentials provider
        AwsSessionCredentials sessionCredentials =
                AwsSessionCredentials.create(
                        credentials.accessKeyId(),
                        credentials.secretAccessKey(),
                        credentials.sessionToken()
                );

        // 6. Verify the customer AWS identity
        try (StsClient customerStsClient = StsClient.builder()
                .region(Region.AP_SOUTH_1)
                .credentialsProvider(
                        StaticCredentialsProvider.create(sessionCredentials))
                .build()) {

            GetCallerIdentityResponse identity =
                    customerStsClient.getCallerIdentity();

            // Ensure the assumed account matches the role ARN account
            String expectedAccountId = roleArn.split(":")[4];

            if (!expectedAccountId.equals(identity.account())) {
                throw new IllegalStateException(
                        "AWS account identity does not match role ARN");
            }

            // 7. Persist verified connection
            connection.setAccountId(identity.account());
            connection.setStatus("CONNECTED");

            connectionRepository.save(connection);

            return new CustomerAwsConnectionResponse(
                    identity.account(),
                    identity.arn(),
                    "CONNECTED"
            );
        }
    }
}
