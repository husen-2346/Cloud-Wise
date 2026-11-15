
package cloudwise_backend.aws.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "aws_metric_records", uniqueConstraints = {
        @UniqueConstraint(name = "uk_connection_resource_metric_time", columnNames = {
                "connection_id",
                "resource_id",
                "metric_name",
                "statistic",
                "timestamp"
        })
})
public class AwsMetricRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "connection_id", nullable = false)
    private AwsConnection connection;

    @Column(name = "resource_id", nullable = false, length = 100)
    private String resourceId;

    @Column(name = "metric_name", nullable = false, length = 100)
    private String metricName;

    @Column(nullable = false, length = 30)
    private String statistic;

    @Column(nullable = false)
    private Double value;

    @Column(length = 30)
    private String unit;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(nullable = false, length = 50)
    private String region;

    @Column(name = "last_synced_at", nullable = false)
    private LocalDateTime lastSyncedAt;

    public AwsMetricRecord() {
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

    public String getMetricName() {
        return metricName;
    }

    public void setMetricName(String metricName) {
        this.metricName = metricName;
    }

    public String getStatistic() {
        return statistic;
    }

    public void setStatistic(String statistic) {
        this.statistic = statistic;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public LocalDateTime getLastSyncedAt() {
        return lastSyncedAt;
    }
}
