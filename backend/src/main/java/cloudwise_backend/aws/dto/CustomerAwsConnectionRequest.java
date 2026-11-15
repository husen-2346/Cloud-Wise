
package cloudwise_backend.aws.dto;

import jakarta.validation.constraints.NotBlank;

public record CustomerAwsConnectionRequest(

        @NotBlank(message = "Role ARN is required")
        String roleArn

) {}
