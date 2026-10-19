
package cloudwise_backend.auth.dto;

public record AuthResponse(
        Long id,
        String name,
        String email,
        String message
) {}
