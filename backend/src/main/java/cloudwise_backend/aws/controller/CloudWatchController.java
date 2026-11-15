
package cloudwise_backend.aws.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cloudwise_backend.aws.dto.CloudWatchMetricResponse;
import cloudwise_backend.aws.service.CloudWatchService;

@RestController
@RequestMapping("/api/aws/cloudwatch")
public class CloudWatchController {

    private final CloudWatchService cloudWatchService;

    public CloudWatchController(CloudWatchService cloudWatchService) {
        this.cloudWatchService = cloudWatchService;
    }

    @GetMapping("/cpu")
    public ResponseEntity<List<CloudWatchMetricResponse>> getCpuMetrics(
            @RequestParam String instanceId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            Instant startTime,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            Instant endTime
    ) {

        if (!startTime.isBefore(endTime)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                cloudWatchService.getCpuUtilization(
                        instanceId,
                        startTime,
                        endTime
                )
        );
    }
}
