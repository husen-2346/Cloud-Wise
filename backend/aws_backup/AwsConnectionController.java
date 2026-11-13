
package cloudwise_backend.aws;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/aws")
public class AwsConnectionController {

    private final AwsConnectionService awsConnectionService;
    private final AwsDiscoveryService awsDiscoveryService;

    public AwsConnectionController(
            AwsConnectionService awsConnectionService,
            AwsDiscoveryService awsDiscoveryService) {
        this.awsConnectionService = awsConnectionService;
        this.awsDiscoveryService = awsDiscoveryService;
    }

    @GetMapping("/identity")
    public ResponseEntity<String> getIdentity() {
        return ResponseEntity.ok(
                awsConnectionService.getCurrentAwsIdentity());
    }

    @GetMapping("/instances")
    public ResponseEntity<List<AwsDiscoveryService.Ec2InstanceDto>> getInstances() {

        return ResponseEntity.ok(
                awsDiscoveryService.discoverInstances());
    }

    @GetMapping("/volumes")
    public ResponseEntity<List<AwsDiscoveryService.EbsVolumeDto>> getVolumes() {

        return ResponseEntity.ok(
                awsDiscoveryService.discoverVolumes());
    }
}
