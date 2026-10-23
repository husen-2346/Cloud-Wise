
package cloudwise_backend.ai;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
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
            @Value("${openrouter.api-key}") String apiKey) {

        this.apiKey = apiKey;

        this.restClient = RestClient.builder()
                .baseUrl("https://openrouter.ai/api/v1")
                .build();
    }

    public String explain(String context) {

        if (context == null || context.isBlank()) {
            throw new IllegalArgumentException(
                    "Analysis context cannot be empty.");
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
                "max_tokens", 2200,
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
            JsonNode response = restClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                throw new IllegalStateException(
                        "OpenRouter returned an empty response.");
            }

            if (response.has("error")) {
                log.error("OpenRouter returned an error response.");
                throw new IllegalStateException(
                        "OpenRouter could not generate the explanation.");
            }

            JsonNode choices = response.path("choices");

            if (!choices.isArray() || choices.isEmpty()) {
                log.error(
                        "OpenRouter response contains no choices. Finish reason: {}",
                        response.path("error").asString("not provided")
                );
                throw new IllegalStateException(
                        "OpenRouter returned no generated choices.");
            }

            JsonNode choice = choices.path(0);
            JsonNode message = choice.path("message");
            JsonNode content = message.path("content");

            if (!content.isString() || content.asString("").isBlank()) {
                log.error(
                        "OpenRouter returned no text content. Finish reason: {}",
                        choice.path("finish_reason").asString("unknown")
                );
                throw new IllegalStateException(
                        "OpenRouter returned no explanation text.");
            }

            String explanation = content.asString("").trim();

            if (explanation.length() < 100) {
                log.warn(
                        "OpenRouter returned an unusually short explanation ({} characters).",
                        explanation.length()
                );
            }

            return explanation;

        } catch (RestClientResponseException ex) {
            log.error(
                    "OpenRouter request failed. HTTP status: {}",
                    ex.getStatusCode().value()
            );

            throw new IllegalStateException(
                    "The AI explanation service is temporarily unavailable.",
                    ex
            );
        }
    }
}
