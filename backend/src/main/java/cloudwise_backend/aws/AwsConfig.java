
package cloudwise_backend.aws;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.sts.StsClient;

@Configuration
public class AwsConfig {

    private static final Region AWS_REGION = Region.AP_SOUTH_1;

    @Bean
    public ProfileCredentialsProvider awsCredentialsProvider() {
        return ProfileCredentialsProvider.create("cloudwise-readonly");
    }

    @Bean
    public StsClient stsClient(
            ProfileCredentialsProvider awsCredentialsProvider) {
        return StsClient.builder()
                .region(AWS_REGION)
                .credentialsProvider(awsCredentialsProvider)
                .build();
    }

    @Bean
    public Ec2Client ec2Client(
            ProfileCredentialsProvider awsCredentialsProvider) {
        return Ec2Client.builder()
                .region(AWS_REGION)
                .credentialsProvider(awsCredentialsProvider)
                .build();
    }
}
