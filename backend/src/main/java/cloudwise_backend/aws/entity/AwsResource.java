
package cloudwise_backend.aws.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "aws_resources",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_connection_resource",
            columnNames = {
                "connection_id",
                "resource_id",
                "resource_type",
                "region"
            }
        )
    }
)
public class AwsResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "connection_id", nullable = false)
    private AwsConnection connection;

    @Column(name = "resource_id", nullable = false, length = 100)
    private String resourceId;

    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;

    @Column(name = "resource_name", length = 255)
    private String resourceName;

    @Column(length = 100)
    private String state;

    @Column(nullable = false, length = 50)
    private String region;

    @Column(name = "availability_zone", length = 50)
    private String availabilityZone;

    @Column(name = "last_synced_at", nullable = false)
    private LocalDateTime lastSyncedAt;

    public AwsResource() {
    }

    @PrePersist
    @PreUpdate
    protected void updateTimestamp() {
        this.lastSyncedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public AwsConnection getConnection() {
        return connection;
    }

    public void setConnection(AwsConnection connection) {
        this.connection = connection;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getAvailabilityZone() {
        return availabilityZone;
    }

    public void setAvailabilityZone(String availabilityZone) {
        this.availabilityZone = availabilityZone;
    }

    public LocalDateTime getLastSyncedAt() {
        return lastSyncedAt;
    }
}
