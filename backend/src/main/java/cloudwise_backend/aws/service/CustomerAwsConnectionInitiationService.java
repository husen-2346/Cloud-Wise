
package cloudwise_backend.aws.service;

import cloudwise_backend.auth.entity.User;
import cloudwise_backend.auth.repository.UserRepository;
import cloudwise_backend.aws.dto.CustomerAwsConnectionInitiationResponse;
import cloudwise_backend.aws.dto.CustomerAwsConnectionRequest;
import cloudwise_backend.aws.entity.AwsConnection;
import cloudwise_backend.aws.repository.AwsConnectionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerAwsConnectionInitiationService {

    private final UserRepository userRepository;
    private final AwsConnectionRepository connectionRepository;
    private final ExternalIdGenerator externalIdGenerator;

    public CustomerAwsConnectionInitiationService(
            UserRepository userRepository,
            AwsConnectionRepository connectionRepository,
            ExternalIdGenerator externalIdGenerator) {
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
        this.externalIdGenerator = externalIdGenerator;
    }

    @Transactional
    public CustomerAwsConnectionInitiationResponse initiate(
            CustomerAwsConnectionRequest request,
            String userEmail) {

        // 1. Identify the authenticated CloudWise user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("CloudWise user not found"));

        // 2. Generate a unique External ID
        String externalId = externalIdGenerator.generate();

        // 3. Create a pending AWS connection
        AwsConnection connection = new AwsConnection();
        connection.setUser(user);
        connection.setRoleArn(request.roleArn());
        connection.setExternalId(externalId);
        connection.setStatus("PENDING");

        // 4. Save the connection
        AwsConnection savedConnection =
                connectionRepository.save(connection);

        // 5. Return setup details
        return new CustomerAwsConnectionInitiationResponse(
                savedConnection.getId(),
                null,
                savedConnection.getRoleArn(),
                savedConnection.getExternalId(),
                savedConnection.getStatus()
        );
    }
}
