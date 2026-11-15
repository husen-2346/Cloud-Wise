
package cloudwise_backend.aws.service;

import java.security.SecureRandom;
import java.util.Base64;

import org.springframework.stereotype.Component;

@Component
public class ExternalIdGenerator {

    private final SecureRandom secureRandom = new SecureRandom();

    public String generate() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        return "cloudwise-" +
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(randomBytes);
    }
}
