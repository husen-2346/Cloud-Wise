package cloudwise_backend.aws.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cloudwise_backend.aws.dto.CostExplorerResponse;
import cloudwise_backend.aws.service.CostExplorerService;

@RestController
@RequestMapping("/api/aws/connections")
public class CostExplorerController {

    private final CostExplorerService costExplorerService;

    public CostExplorerController(CostExplorerService costExplorerService) {
        this.costExplorerService = costExplorerService;
    }

    @GetMapping("/{connectionId}/costs/services")
    public ResponseEntity<List<CostExplorerResponse>> getServiceCosts(
            @PathVariable Long connectionId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            Authentication authentication) {

        if (!startDate.isBefore(endDate)) {
            return ResponseEntity.badRequest().build();
        }

        List<CostExplorerResponse> costs =
                costExplorerService.getServiceCosts(
                        connectionId,
                        authentication.getName(),
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(costs);
    }
}