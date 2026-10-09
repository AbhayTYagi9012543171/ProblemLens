POSITIVE={"good","great","easy","helpful","love","fast","clear","satisfied","excellent"}
NEGATIVE={"bad","hard","difficult","slow","confusing","problem","poor","frustrated","annoying"}

def sentiment(text):
    words={w.strip(".,!?;:").lower() for w in text.split()}
    pos=len(words & POSITIVE); neg=len(words & NEGATIVE)
    total=max(pos+neg,1)
    score=(pos-neg)/total
    label="positive" if score>0.15 else "negative" if score<-0.15 else "neutral"
    return {"label":label,"score":round(score,3),"positive_hits":pos,"negative_hits":neg}
