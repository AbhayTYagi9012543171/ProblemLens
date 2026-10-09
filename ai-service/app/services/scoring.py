def problem_score(frequency,impact,urgency,confidence):
    score=frequency*.30+impact*.30+urgency*.20+confidence*.20
    severity="low" if score<25 else "medium" if score<50 else "high" if score<75 else "critical"
    return {"score":round(score,2),"severity":severity}
