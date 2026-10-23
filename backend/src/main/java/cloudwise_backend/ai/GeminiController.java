
package cloudwise_backend.ai;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class GeminiController {

    private final GeminiService geminiService;

    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/explain")
    public ResponseEntity<Map<String, String>> explain(
            @RequestBody Map<String, String> request) {

        String context = request.get("context");

        if (context == null || context.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Analysis context is required.")
            );
        }

        String explanation = geminiService.explain(context);
         System.out.println("AI CONTROLLER REACHED");
        return ResponseEntity.ok(
                Map.of("explanation", explanation)
        );

    
    }
}
