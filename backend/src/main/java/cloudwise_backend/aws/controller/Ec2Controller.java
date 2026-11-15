
package cloudwise_backend.aws.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import cloudwise_backend.aws.dto.Ec2InstanceResponse;
import cloudwise_backend.aws.service.Ec2DiscoveryService;

@RestController
@RequestMapping("/api/aws/connections")
public class Ec2Controller {

    private final Ec2DiscoveryService ec2DiscoveryService;

    public Ec2Controller(Ec2DiscoveryService ec2DiscoveryService) {
        this.ec2DiscoveryService = ec2DiscoveryService;
    }

    @GetMapping("/{connectionId}/instances")
    public ResponseEntity<List<Ec2InstanceResponse>> getInstances(
            @PathVariable Long connectionId,
            Authentication authentication) {

        return ResponseEntity.ok(
                ec2DiscoveryService.getInstances(
                        connectionId,
                        authentication.getName()
                )
        );
    }
}
