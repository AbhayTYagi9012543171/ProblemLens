from pydantic import BaseModel, Field
from typing import List, Optional

class EvidenceItem(BaseModel):
    id: Optional[str] = None
    text: str = ""

class AnalyzeRequest(BaseModel):
    project: Optional[str] = None
    type: str = "FULL"
    evidence: List[EvidenceItem] = Field(default_factory=list)
