package cloudwise_backend.aws.service;

import cloudwise_backend.aws.dto.AwsPlatformConfigResponse;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class PlatformConfigServiceTest {

    @Test
    void verifiesValidUserArn() {
        String testArn = "arn:aws:iam::748076390893:user/cloudwise-local-dev";
        AwsPlatformConfigService svc = new AwsPlatformConfigService(testArn);
        AwsPlatformConfigResponse res = svc.getPlatformConfig();
        assertNotNull(res);
        assertEquals(testArn, res.trustPrincipalArn());
    }

    @Test
    void verifiesValidRoleArn() {
        String testArn = "arn:aws:iam::112233445566:role/PlatformAssumeRole";
        AwsPlatformConfigService svc = new AwsPlatformConfigService(testArn);
        AwsPlatformConfigResponse res = svc.getPlatformConfig();
        assertNotNull(res);
        assertEquals(testArn, res.trustPrincipalArn());
    }

    @Test
    void rejectsEmptyArn() {
        AwsPlatformConfigService svc = new AwsPlatformConfigService("");
        assertThrows(ResponseStatusException.class, () -> svc.getPlatformConfig());
    }

    @Test
    void rejectsMalformedArn() {
        AwsPlatformConfigService svc = new AwsPlatformConfigService("not-an-arn");
        assertThrows(ResponseStatusException.class, () -> svc.getPlatformConfig());
    }
}
