
package cloudwise_backend.aws.repository;

import cloudwise_backend.aws.entity.AwsResource;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AwsResourceRepository
        extends JpaRepository<AwsResource, Long> {

    List<AwsResource> findAllByConnectionId(Long connectionId);

    Optional<AwsResource> findByConnectionIdAndResourceIdAndResourceTypeAndRegion(
            Long connectionId,
            String resourceId,
            String resourceType,
            String region
    );

    boolean existsByConnectionIdAndResourceIdAndResourceTypeAndRegion(
            Long connectionId,
            String resourceId,
            String resourceType,
            String region
    );
}
