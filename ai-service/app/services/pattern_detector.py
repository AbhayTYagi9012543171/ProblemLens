from collections import Counter

def recurring_patterns(texts):
    counts=Counter()
    for text in texts:
        for word in text.lower().split():
            word="".join(c for c in word if c.isalnum())
            if len(word)>=5: counts[word]+=1
    return [{"term":w,"count":c} for w,c in counts.most_common(15) if c>1]
