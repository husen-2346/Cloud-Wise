
package cloudwise_backend.aws.controller;

import cloudwise_backend.aws.service.AwsResourceSyncService;
import cloudwise_backend.aws.service.AwsResourceSyncService.ResourceSyncResult;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/aws/connections")
public class AwsResourceSyncController {

    private final AwsResourceSyncService syncService;

    public AwsResourceSyncController(
            AwsResourceSyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/{connectionId}/sync/resources")
    public ResponseEntity<ResourceSyncResult> syncResources(
            @PathVariable Long connectionId,
            Authentication authentication) {

        ResourceSyncResult result = syncService.syncResources(
                connectionId,
                authentication.getName()
        );

        return ResponseEntity.ok(result);
    }
}
