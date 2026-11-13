
package cloudwise_backend.aws.service;

import org.springframework.stereotype.Service;

import cloudwise_backend.aws.dto.AwsIdentityResponse;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.model.GetCallerIdentityResponse;

@Service
public class AwsIdentityService {

    private final StsClient stsClient;

    public AwsIdentityService(StsClient stsClient) {
        this.stsClient = stsClient;
    }

    public AwsIdentityResponse getIdentity() {

        GetCallerIdentityResponse identity =
                stsClient.getCallerIdentity();

        return new AwsIdentityResponse(
                identity.account(),
                identity.userId(),
                identity.arn(),
                "CONNECTED"
        );
    }
}
