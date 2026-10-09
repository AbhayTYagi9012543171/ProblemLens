const clamp = (value, min = 0, max = 100) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
};

export function calculateScore({
  frequency = 0,
  impact = 0,
  urgency = 0,
  confidence = 0,
  frequencyScore,
  impactScore,
  confidenceScore,
  opportunityScore,
} = {}) {
  const frequencyValue = clamp(frequencyScore ?? frequency);
  const impactValue = clamp(impactScore ?? impact);
  const urgencyValue = clamp(urgency);
  const confidenceValue = clamp(confidenceScore ?? confidence);

  const calculated = (
    frequencyValue * 0.30 +
    impactValue * 0.30 +
    urgencyValue * 0.20 +
    confidenceValue * 0.20
  );

  const finalScore = clamp(
    opportunityScore ?? calculated
  );

  let severity = "Low";
  if (finalScore >= 75) severity = "High";
  else if (finalScore >= 50) severity = "Medium";

  return {
    score: Number(finalScore.toFixed(2)),
    opportunityScore: Number(finalScore.toFixed(2)),
    frequencyScore: Number(frequencyValue.toFixed(2)),
    impactScore: Number(impactValue.toFixed(2)),
    confidence: Number(confidenceValue.toFixed(2)),
    severity,
  };
}
