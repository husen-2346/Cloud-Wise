
package cloudwise_backend.auth.dto;

public record LoginResponse(
        Long id,
        String name,
        String email,
        String token,
        String tokenType
) {}
