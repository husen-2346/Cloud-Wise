
package cloudwise_backend.aws.dto;

import java.util.List;

public record EbsVolumeResponse(
        String volumeId,
        Integer sizeGiB,
        String volumeType,
        String state,
        String availabilityZone,
        List<String> attachedInstanceIds,
        boolean encrypted,
        String createTime
) {}
