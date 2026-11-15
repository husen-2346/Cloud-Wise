
package cloudwise_backend.aws.repository;

import cloudwise_backend.aws.entity.AwsConnection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AwsConnectionRepository
        extends JpaRepository<AwsConnection, Long> {

    List<AwsConnection> findAllByUserId(Long userId);

    Optional<AwsConnection> findByIdAndUserId(Long id, Long userId);

    boolean existsByAccountIdAndUserId(String accountId, Long userId);
}
