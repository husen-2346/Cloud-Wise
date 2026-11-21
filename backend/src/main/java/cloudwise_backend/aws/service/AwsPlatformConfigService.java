package cloudwise_backend.aws.service;

import cloudwise_backend.aws.dto.AwsPlatformConfigResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Pattern;

@Service
public class AwsPlatformConfigService {

    // Validates AWS IAM User or Role ARNs (e.g. arn:aws:iam::123456789012:user/name or arn:aws:iam::123456789012:role/name)
    private static final Pattern IAM_PRINCIPAL_PATTERN = Pattern.compile(
            "^arn:aws(-[a-z]+)*:iam::\\d{12}:(user|role)/[\\w+=,.@/-]+$"
    );

    private final String trustPrincipalArn;

    public AwsPlatformConfigService(
            @Value("${cloudwise.aws.trust-principal-arn:}") String trustPrincipalArn) {
        this.trustPrincipalArn = trustPrincipalArn != null ? trustPrincipalArn.trim() : "";
    }

    public AwsPlatformConfigResponse getPlatformConfig() {
        if (trustPrincipalArn.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "CloudWise AWS trust principal ARN is not configured on the backend. " +
                    "Set the CLOUDWISE_TRUST_PRINCIPAL_ARN environment variable or cloudwise.aws.trust-principal-arn property."
            );
        }

        if (!isValidPrincipalArn(trustPrincipalArn)) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Configured CloudWise AWS trust principal ARN is invalid: " + trustPrincipalArn +
                    ". Must be a valid AWS IAM user or role ARN."
            );
        }

        return new AwsPlatformConfigResponse(trustPrincipalArn);
    }

    public static boolean isValidPrincipalArn(String arn) {
        if (arn == null || arn.isBlank()) {
            return false;
        }
        return IAM_PRINCIPAL_PATTERN.matcher(arn.trim()).matches();
    }
}
