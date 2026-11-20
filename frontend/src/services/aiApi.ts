export interface ExplainAnalysisRequest {
  context: string;
}

export interface ExplainAnalysisResponse {
  explanation: string;
}

/**
 * Sends evidence and resource information context to backend AI service for explanation.
 */
export async function explainAnalysis(
  token: string,
  context: string,
): Promise<ExplainAnalysisResponse> {
  if (!context || !context.trim()) {
    throw new Error('Analysis context is required.');
  }

  const response = await fetch('/api/ai/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ context }),
  });

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || '';
    } catch {
      errorMessage = await response.text().catch(() => '');
    }
    throw new Error(errorMessage || `AI service returned error status ${response.status}`);
  }

  return response.json() as Promise<ExplainAnalysisResponse>;
}
