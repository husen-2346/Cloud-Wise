
package cloudwise_backend.aws;

import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.model.GetCallerIdentityResponse;

@Service
public class AwsConnectionService {

    private final StsClient stsClient;

    public AwsConnectionService(StsClient stsClient) {
        this.stsClient = stsClient;
    }

    public String getCurrentAwsIdentity() {
        GetCallerIdentityResponse identity =
                stsClient.getCallerIdentity();

        return "Account: " + identity.account()
                + ", ARN: " + identity.arn();
    }
}
