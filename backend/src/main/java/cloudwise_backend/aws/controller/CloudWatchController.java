
package cloudwise_backend.aws.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import cloudwise_backend.aws.dto.CloudWatchMetricResponse;
import cloudwise_backend.aws.service.CloudWatchService;

@RestController
@RequestMapping("/api/aws/connections")
public class CloudWatchController {

    private final CloudWatchService cloudWatchService;

    public CloudWatchController(
            CloudWatchService cloudWatchService) {
        this.cloudWatchService = cloudWatchService;
    }

    @GetMapping("/{connectionId}/cloudwatch/cpu")
    public ResponseEntity<List<CloudWatchMetricResponse>> getCpuMetrics(

            @PathVariable Long connectionId,

            @RequestParam String instanceId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            Instant startTime,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            Instant endTime,

            Authentication authentication) {

        if (!startTime.isBefore(endTime)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                cloudWatchService.getCpuUtilization(
                        connectionId,
                        authentication.getName(),
                        instanceId,
                        startTime,
                        endTime
                )
        );
    }
}
