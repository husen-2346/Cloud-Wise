
package cloudwise_backend.aws.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cloudwise_backend.aws.dto.AwsIdentityResponse;
import cloudwise_backend.aws.service.AwsIdentityService;

@RestController
@RequestMapping("/api/aws")
public class AwsConnectionController {

    private final AwsIdentityService awsIdentityService;

    public AwsConnectionController(AwsIdentityService awsIdentityService) {
        this.awsIdentityService = awsIdentityService;
    }

    @GetMapping("/identity")
    public ResponseEntity<AwsIdentityResponse> getIdentity() {
        return ResponseEntity.ok(awsIdentityService.getIdentity());
    }
}
