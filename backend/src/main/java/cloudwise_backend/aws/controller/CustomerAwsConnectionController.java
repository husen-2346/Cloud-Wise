
package cloudwise_backend.aws.controller;

import cloudwise_backend.aws.dto.CustomerAwsConnectionInitiationResponse;
import cloudwise_backend.aws.dto.CustomerAwsConnectionRequest;
import cloudwise_backend.aws.dto.CustomerAwsConnectionResponse;
import cloudwise_backend.aws.service.CustomerAwsConnectionInitiationService;
import cloudwise_backend.aws.service.CustomerAwsConnectionService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/aws/connections")
public class CustomerAwsConnectionController {

    private final CustomerAwsConnectionInitiationService initiationService;
    private final CustomerAwsConnectionService connectionService;

    public CustomerAwsConnectionController(
            CustomerAwsConnectionInitiationService initiationService,
            CustomerAwsConnectionService connectionService) {
        this.initiationService = initiationService;
        this.connectionService = connectionService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<CustomerAwsConnectionInitiationResponse> initiate(
            @Valid @RequestBody CustomerAwsConnectionRequest request,
            Authentication authentication) {

        var response = initiationService.initiate(
                request,
                authentication.getName()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{connectionId}/verify")
    public ResponseEntity<CustomerAwsConnectionResponse> verify(
            @PathVariable Long connectionId,
            Authentication authentication) {

        var response = connectionService.verify(
                connectionId,
                authentication.getName()
        );

        return ResponseEntity.ok(response);
    }
}
