
package cloudwise_backend.aws.controller;

import java.time.Instant;
import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import cloudwise_backend.aws.service.AwsTelemetrySyncService;
import cloudwise_backend.aws.service.AwsTelemetrySyncService.MetricSyncResult;
import cloudwise_backend.aws.service.AwsTelemetrySyncService.CostSyncResult;

@RestController
@RequestMapping("/api/aws/connections")
public class AwsTelemetrySyncController {

    private final AwsTelemetrySyncService telemetrySyncService;

    public AwsTelemetrySyncController(
            AwsTelemetrySyncService telemetrySyncService) {
        this.telemetrySyncService = telemetrySyncService;
    }

    @PostMapping("/{connectionId}/sync/cloudwatch/cpu")
    public ResponseEntity<MetricSyncResult> syncCpuMetrics(
            @PathVariable Long connectionId,
            @RequestParam String instanceId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            Instant startTime,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            Instant endTime,

            Authentication authentication) {

        if (startTime == null || endTime == null
                || !startTime.isBefore(endTime)) {
            return ResponseEntity.badRequest().build();
        }

        MetricSyncResult result =
                telemetrySyncService.syncCpuMetrics(
                        connectionId,
                        authentication.getName(),
                        instanceId,
                        startTime,
                        endTime
                );

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{connectionId}/sync/costs")
    public ResponseEntity<CostSyncResult> syncCosts(
            @PathVariable Long connectionId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            Authentication authentication) {

        if (startDate == null || endDate == null
                || !startDate.isBefore(endDate)) {
            return ResponseEntity.badRequest().build();
        }

        CostSyncResult result =
                telemetrySyncService.syncCosts(
                        connectionId,
                        authentication.getName(),
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(result);
    }
}
