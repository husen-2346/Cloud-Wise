package cloudwise_backend.aws.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cloudwise_backend.aws.dto.AwsIdentityResponse;
import cloudwise_backend.aws.dto.AwsPlatformConfigResponse;
import cloudwise_backend.aws.service.AwsIdentityService;
import cloudwise_backend.aws.service.AwsPlatformConfigService;

@RestController
@RequestMapping("/api/aws")
public class AwsConnectionController {

    private final AwsIdentityService awsIdentityService;
    private final AwsPlatformConfigService awsPlatformConfigService;

    public AwsConnectionController(
            AwsIdentityService awsIdentityService,
            AwsPlatformConfigService awsPlatformConfigService) {
        this.awsIdentityService = awsIdentityService;
        this.awsPlatformConfigService = awsPlatformConfigService;
    }

    @GetMapping("/identity")
    public ResponseEntity<AwsIdentityResponse> getIdentity() {
        return ResponseEntity.ok(awsIdentityService.getIdentity());
    }

    @GetMapping("/config")
    public ResponseEntity<AwsPlatformConfigResponse> getConfig() {
        return ResponseEntity.ok(awsPlatformConfigService.getPlatformConfig());
    }
}
