import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from .schemas import AnalyzeRequest
from .services.text_analyzer import analyze
from .services.scoring import problem_score

load_dotenv()

app = FastAPI(
    title="ProblemLens AI Service",
    version="1.1.0",
    description="Explainable research evidence analysis for ProblemLens.",
)

ALLOWED_ANALYSIS_TYPES = {"SUMMARY", "KEYWORDS", "SENTIMENT", "CLUSTERS", "PATTERNS", "FULL"}


@app.get("/health")
def health():
    return {"success": True, "status": "ok", "service": "problemlens-ai"}


@app.post("/analyze")
def run_analysis(payload: AnalyzeRequest):
    analysis_type = (payload.type or "FULL").strip().upper()
    if analysis_type not in ALLOWED_ANALYSIS_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported analysis type. Allowed types: {', '.join(sorted(ALLOWED_ANALYSIS_TYPES))}",
        )

    texts = [item.text.strip() for item in payload.evidence if item.text and item.text.strip()]
    if not texts:
        raise HTTPException(status_code=422, detail="At least one non-empty evidence item is required.")

    full_result = analyze(texts)
    common = {"type": analysis_type, "document_count": full_result.get("document_count", len(texts))}

    if analysis_type == "SUMMARY":
        return {**common, "summary": full_result.get("summary", "")}
    if analysis_type == "KEYWORDS":
        return {**common, "keywords": full_result.get("keywords", [])}
    if analysis_type == "SENTIMENT":
        return {**common, "sentiment": full_result.get("sentiment", {})}
    if analysis_type == "CLUSTERS":
        return {**common, "clusters": full_result.get("clusters", [])}
    if analysis_type == "PATTERNS":
        return {**common, "recurring_patterns": full_result.get("recurring_patterns", [])}

    return {**full_result, "type": "FULL"}


@app.post("/score")
def score(payload: dict):
    try:
        return problem_score(
            float(payload.get("frequency", 0)),
            float(payload.get("impact", 0)),
            float(payload.get("urgency", 0)),
            float(payload.get("confidence", 0)),
        )
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=422, detail="Score inputs must be numeric.") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=os.getenv("AI_HOST", "127.0.0.1"),
        port=int(os.getenv("AI_PORT", "8001")),
        reload=os.getenv("AI_RELOAD", "false").lower() == "true",
    )
