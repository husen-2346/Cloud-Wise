package cloudwise_backend.ai;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class GeminiServiceLiveTest {

    @Autowired
    private GeminiService geminiService;

    @Test
    @Disabled("Manual live verification against OpenRouter API")
    @DisplayName("Verify actual OpenRouter API call succeeds with injected key")
    void testExplainLiveApiCall() {
        String testContext = "EC2 instance i-0123456789abcdef0 running t3.medium in ap-south-1 with average CPU 2.5%.";
        String explanation = geminiService.explain(testContext);

        assertNotNull(explanation);
        assertFalse(explanation.isBlank());
        System.out.println("=== OPENROUTER EXPLANATION RECEIVED ===");
        System.out.println("Length: " + explanation.length());
        System.out.println("Preview: " + explanation.substring(0, Math.min(200, explanation.length())));
        System.out.println("========================================");
    }
}
