from .keyword_extractor import extract_keywords
from .sentiment import sentiment
from .clustering import cluster_texts
from .pattern_detector import recurring_patterns

def analyze(texts):
    sentiments=[sentiment(t) for t in texts]
    labels={"positive":0,"neutral":0,"negative":0}
    for s in sentiments:labels[s["label"]]+=1
    return {
        "document_count":len(texts),
        "keywords":extract_keywords(texts),
        "sentiment":{"documents":sentiments,"distribution":labels},
        "clusters":cluster_texts(texts),
        "recurring_patterns":recurring_patterns(texts),
        "summary":f"Analyzed {len(texts)} evidence item(s) using explainable TF-IDF, clustering, keyword and lexical sentiment methods."
    }
