
package cloudwise_backend.aws.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.cloudwatch.CloudWatchClient;
import software.amazon.awssdk.services.costexplorer.CostExplorerClient;

@Configuration
public class AwsConfig {

    @Value("${cloudwise.aws.profile:cloudwise-readonly}")
    private String awsProfile;

    @Value("${cloudwise.aws.region:ap-south-1}")
    private String awsRegion;

    private ProfileCredentialsProvider credentialsProvider() {
        return ProfileCredentialsProvider.builder()
                .profileName(awsProfile)
                .build();
    }

    @Bean
    public StsClient stsClient() {
        return StsClient.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(credentialsProvider())
                .build();
    }

    @Bean
    public Ec2Client ec2Client() {
        return Ec2Client.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(credentialsProvider())
                .build();
    }

    @Bean
    public CloudWatchClient cloudWatchClient() {
        return CloudWatchClient.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(credentialsProvider())
                .build();
    }

    @Bean
    public CostExplorerClient costExplorerClient() {
        return CostExplorerClient.builder()
                // Cost Explorer API endpoint region
                .region(Region.US_EAST_1)
                .credentialsProvider(credentialsProvider())
                .build();
    }
}
