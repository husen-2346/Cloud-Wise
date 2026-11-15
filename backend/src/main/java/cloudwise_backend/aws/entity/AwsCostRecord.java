
package cloudwise_backend.aws.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "aws_cost_records",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_connection_service_date",
            columnNames = {
                "connection_id",
                "service",
                "cost_date",
                "region"
            }
        )
    }
)
public class AwsCostRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "connection_id", nullable = false)
    private AwsConnection connection;

    @Column(name = "cost_date", nullable = false)
    private LocalDate costDate;

    @Column(nullable = false, length = 255)
    private String service;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(length = 50)
    private String region;

    @Column(name = "last_synced_at", nullable = false)
    private LocalDateTime lastSyncedAt;

    public AwsCostRecord() {
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

    public LocalDate getCostDate() {
        return costDate;
    }

    public void setCostDate(LocalDate costDate) {
        this.costDate = costDate;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
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

