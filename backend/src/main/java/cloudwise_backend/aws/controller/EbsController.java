
package cloudwise_backend.aws.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import cloudwise_backend.aws.dto.EbsVolumeResponse;
import cloudwise_backend.aws.service.EbsDiscoveryService;

@RestController
@RequestMapping("/api/aws/connections")
public class EbsController {

    private final EbsDiscoveryService ebsDiscoveryService;

    public EbsController(EbsDiscoveryService ebsDiscoveryService) {
        this.ebsDiscoveryService = ebsDiscoveryService;
    }

    @GetMapping("/{connectionId}/volumes")
    public ResponseEntity<List<EbsVolumeResponse>> getVolumes(
            @PathVariable Long connectionId,
            Authentication authentication) {

        return ResponseEntity.ok(
                ebsDiscoveryService.getVolumes(
                        connectionId,
                        authentication.getName()
                )
        );
    }
}
