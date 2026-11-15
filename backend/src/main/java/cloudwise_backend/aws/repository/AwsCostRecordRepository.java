
package cloudwise_backend.aws.repository;

import cloudwise_backend.aws.entity.AwsCostRecord;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AwsCostRecordRepository
        extends JpaRepository<AwsCostRecord, Long> {

    List<AwsCostRecord> findAllByConnectionIdAndCostDateBetween(
            Long connectionId,
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<AwsCostRecord> findByConnectionIdAndServiceAndCostDateAndRegion(
            Long connectionId,
            String service,
            LocalDate costDate,
            String region
    );

    boolean existsByConnectionIdAndCostDate(
            Long connectionId,
            LocalDate costDate
    );
}
