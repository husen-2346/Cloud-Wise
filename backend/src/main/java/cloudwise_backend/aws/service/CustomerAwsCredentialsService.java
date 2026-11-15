
package cloudwise_backend.aws.service;

import cloudwise_backend.auth.entity.User;
import cloudwise_backend.auth.repository.UserRepository;
import cloudwise_backend.aws.entity.AwsConnection;
import cloudwise_backend.aws.repository.AwsConnectionRepository;

import org.springframework.stereotype.Service;

import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest;
import software.amazon.awssdk.services.sts.model.AssumeRoleResponse;

@Service
public class CustomerAwsCredentialsService {

    private final StsClient platformStsClient;
    private final UserRepository userRepository;
    private final AwsConnectionRepository connectionRepository;

    public CustomerAwsCredentialsService(
            StsClient platformStsClient,
            UserRepository userRepository,
            AwsConnectionRepository connectionRepository) {

        this.platformStsClient = platformStsClient;
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
    }

    public AwsCredentialsProvider getCredentials(
            Long connectionId,
            String userEmail) {

        // 1. Identify the authenticated CloudWise user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        // 2. Retrieve only this user's AWS connection
        AwsConnection connection = connectionRepository
                .findByIdAndUserId(connectionId, user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "AWS connection not found"));

        // 3. Only connected accounts can be accessed
        if (!"CONNECTED".equals(connection.getStatus())) {
            throw new IllegalStateException(
                    "AWS account is not connected");
        }

        // 4. Request fresh temporary credentials from AWS STS
        AssumeRoleRequest assumeRoleRequest = AssumeRoleRequest.builder()
                .roleArn(connection.getRoleArn())
                .roleSessionName("CloudWiseDataAccess-" + connectionId)
                .externalId(connection.getExternalId())
                .durationSeconds(3600)
                .build();

        AssumeRoleResponse response =
                platformStsClient.assumeRole(assumeRoleRequest);

        var credentials = response.credentials();

        // 5. Create an in-memory credentials provider
        AwsSessionCredentials sessionCredentials =
                AwsSessionCredentials.create(
                        credentials.accessKeyId(),
                        credentials.secretAccessKey(),
                        credentials.sessionToken()
                );

        return StaticCredentialsProvider.create(sessionCredentials);
    }
}
