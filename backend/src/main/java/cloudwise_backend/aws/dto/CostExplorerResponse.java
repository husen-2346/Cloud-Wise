
package cloudwise_backend.aws.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CostExplorerResponse(
        LocalDate date,
        String service,
        BigDecimal amount,
        String unit
) {
}
