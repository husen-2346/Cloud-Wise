
package cloudwise_backend.ai;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import tools.jackson.databind.JsonNode;

@Service
public class GeminiService {

    private static final Logger log =
            LoggerFactory.getLogger(GeminiService.class);

    private final String apiKey;
    private final RestClient restClient;

    public GeminiService(
            @Value("${openrouter.api-key:}") String configuredApiKey) {

        this.apiKey = resolveApiKey(configuredApiKey);

        if (this.apiKey.isBlank()) {
            throw new IllegalStateException(
                    "OpenRouter API key is missing. Check OPENROUTER_API_KEY_NEW or OPENROUTER_API_KEY."
            );
        }

        log.info("OpenRouter API key loaded: true");
        log.info("OpenRouter API key length: {}", this.apiKey.length());
        log.info(
                "OpenRouter API key format valid: {}",
                this.apiKey.startsWith("sk-or-v1-")
        );

        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(this.apiKey.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02X", b));
            }
            String fingerprint = sb.substring(0, 12);
            log.info("OpenRouter API key fingerprint: {}", fingerprint);
            log.info("Matches PowerShell fingerprint 206919D7E864: {}", "206919D7E864".equals(fingerprint));
        } catch (Exception e) {
            log.warn("Could not calculate fingerprint", e);
        }

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(30));
        requestFactory.setReadTimeout(Duration.ofSeconds(120));

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl("https://openrouter.ai/api/v1")
                .defaultHeader(
                        "Accept",
                        MediaType.APPLICATION_JSON_VALUE
                )
                .defaultHeader(
                        "Content-Type",
                        MediaType.APPLICATION_JSON_VALUE
                )
                .build();
    }

    private static String resolveApiKey(String configuredKey) {
        // 1. Direct process environment variable OPENROUTER_API_KEY_NEW
        String envNew = System.getenv("OPENROUTER_API_KEY_NEW");
        if (envNew != null && !envNew.isBlank()) {
            return envNew.trim();
        }

        // 2. On Windows, read User registry if shell process environment is stale
        String regKey = getWindowsUserEnv("OPENROUTER_API_KEY_NEW");
        if (regKey != null && !regKey.isBlank()) {
            return regKey;
        }

        // 3. Configured property from application.properties
        if (configuredKey != null && !configuredKey.isBlank()) {
            return configuredKey.trim();
        }

        // 4. Fallback to OPENROUTER_API_KEY from environment
        String envOld = System.getenv("OPENROUTER_API_KEY");
        if (envOld != null && !envOld.isBlank()) {
            return envOld.trim();
        }

        return "";
    }

    private static String getWindowsUserEnv(String varName) {
        if (!System.getProperty("os.name", "").toLowerCase().contains("win")) {
            return null;
        }
        try {
            Process process = new ProcessBuilder("reg", "query", "HKCU\\Environment", "/v", varName)
                    .redirectErrorStream(true)
                    .start();
            try (java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.contains(varName)) {
                        String[] parts = line.trim().split("\\s+");
                        if (parts.length >= 3) {
                            return parts[2].trim();
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    public String explain(String context) {

        if (context == null || context.isBlank()) {
            throw new IllegalArgumentException(
                    "Analysis context cannot be empty."
            );
        }

        String systemPrompt = """
                You are CloudWise AI, an AWS cloud resource analysis assistant.

                Analyze the supplied AWS inventory and rule-based findings.
                Return a complete, accurate, structured Markdown report.

                Use exactly these sections in this order:

                # AWS Resource Analysis

                ## 1. Executive Summary
                Write 2-3 concise sentences summarizing the inventory,
                findings, and limitations.

                ## 2. Observed Facts
                Use this Markdown table:
                | Resource | Observed Details | Status |
                |---|---|---|

                Include the supplied EC2 instances, EBS volumes, and findings.
                Use only values explicitly present in the input.
                Write "Not provided" for missing values.

                ## 3. Potential Optimization Opportunities
                Use this Markdown table:
                | Opportunity | Evidence Available | Potential Benefit | Data Needed to Validate | Recommended Action |
                |---|---|---|---|---|

                Label unverified opportunities:
                "Potential — not yet verified".

                ## 4. Recommended Next Steps
                Give 3-5 prioritized, practical steps.

                ## 5. Data Limitations
                Identify relevant missing billing, utilization, storage,
                or workload data.

                If sufficient billing or utilization data is unavailable,
                state:
                "Verified monthly savings have not been calculated because
                sufficient billing and utilization data is unavailable."

                ACCURACY RULES:
                - Treat the supplied inventory and findings as the source
                  of truth.
                - Never invent resource IDs, metrics, prices, or savings.
                - A running instance is not necessarily idle or oversized.
                - An attached volume is not necessarily unused.
                - An unattached volume needs review; do not assume deletion
                  is safe.
                - If no automated findings are supplied, say so explicitly.
                - Do not confuse resource counts with issue counts.
                - Do not claim recommendations have been implemented.
                - Distinguish confirmed facts from possible opportunities.
                - Explain what evidence is needed to validate each opportunity.
                - Do not recommend automatic resource modifications.

                FORMATTING RULES:
                - Return valid Markdown, not a code block.
                - Finish every sentence and table row.
                - Include all five required sections.
                - Use concise, professional language.
                - Do not include greetings or commentary about these instructions.
                - Prioritize completeness over unnecessary detail.
                """;

        Map<String, Object> requestBody = Map.of(
                "model", "openrouter/free",
                "temperature", 0.2,
                "max_tokens", 3500,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", systemPrompt
                        ),
                        Map.of(
                                "role", "user",
                                "content", context
                        )
                )
        );

        try {

            log.info("Sending AI explanation request to OpenRouter.");
            log.info("OpenRouter model: openrouter/free");
            log.info("API key has surrounding whitespace: {}",
                    !apiKey.equals(apiKey.trim()));

            JsonNode response = restClient.post()
                    .uri("/chat/completions")
                    .header(
                            "Authorization",
                            "Bearer " + apiKey
                    )
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                throw new IllegalStateException(
                        "OpenRouter returned an empty response."
                );
            }

            if (response.has("error")) {
                log.error("OpenRouter returned an error response.");

                throw new IllegalStateException(
                        "OpenRouter could not generate the explanation."
                );
            }

            JsonNode choices = response.path("choices");

            if (!choices.isArray() || choices.isEmpty()) {
                log.error(
                        "OpenRouter response contains no choices."
                );

                throw new IllegalStateException(
                        "OpenRouter returned no generated choices."
                );
            }

            JsonNode choice = choices.path(0);
            JsonNode message = choice.path("message");
            JsonNode content = message.path("content");

            if (!content.isString()
                    || content.asString("").isBlank()) {

                log.error(
                        "OpenRouter returned no text content. Finish reason: {}",
                        choice.path("finish_reason").asString("unknown")
                );

                throw new IllegalStateException(
                        "OpenRouter returned no explanation text."
                );
            }

            String explanation = content.asString("").trim();

            if (explanation.length() < 100) {
                log.warn(
                        "OpenRouter returned an unusually short explanation: {} characters.",
                        explanation.length()
                );
            }

            log.info("AI explanation generated successfully.");

            return explanation;

        } catch (RestClientResponseException ex) {

            log.error(
                    "OpenRouter request failed. HTTP status: {}. Response: {}",
                    ex.getStatusCode().value(),
                    ex.getResponseBodyAsString()
            );

            throw new IllegalStateException(
                    "The AI explanation service is temporarily unavailable.",
                    ex
            );
        }
    }
}
