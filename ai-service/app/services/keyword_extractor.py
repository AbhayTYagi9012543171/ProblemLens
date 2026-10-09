import math
import re
from collections import Counter

# Common English words that don't provide useful problem/opportunity signals.
STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "been", "being",
    "but", "by", "can", "could", "did", "do", "does", "for", "from",
    "had", "has", "have", "he", "her", "here", "hers", "him", "his",
    "how", "i", "if", "in", "into", "is", "it", "its", "itself",
    "just", "me", "more", "most", "my", "no", "not", "of", "on",
    "or", "our", "ours", "out", "over", "same", "she", "should",
    "so", "some", "than", "that", "the", "their", "theirs", "them",
    "then", "there", "these", "they", "this", "those", "to", "too",
    "under", "up", "us", "very", "was", "we", "were", "what", "when",
    "where", "which", "who", "why", "will", "with", "would", "you",
    "your", "yours"
}


def tokenize(text):
    """Convert text into useful lowercase word tokens."""
    return re.findall(r"[a-zA-Z][a-zA-Z0-9'-]{2,}", str(text).lower())


def build_terms(text):
    """
    Build unigram and bigram terms without scikit-learn.
    """
    words = [
        word
        for word in tokenize(text)
        if word not in STOP_WORDS
    ]

    terms = list(words)

    for index in range(len(words) - 1):
        first = words[index]
        second = words[index + 1]

        if first not in STOP_WORDS and second not in STOP_WORDS:
            terms.append(f"{first} {second}")

    return terms


def extract_keywords(texts, limit=15):
    """
    Lightweight TF-IDF-style keyword extraction.

    This intentionally avoids scikit-learn/SciPy so the ProblemLens
    AI service can run in environments where native ML DLLs are blocked.
    """
    if not texts:
        return []

    documents = [str(text or "").strip() for text in texts]
    documents = [text for text in documents if text]

    if not documents:
        return []

    document_terms = []
    term_frequency = Counter()
    document_frequency = Counter()

    for text in documents:
        terms = build_terms(text)
        counts = Counter(terms)

        document_terms.append(counts)
        term_frequency.update(counts)

        for term in counts:
            document_frequency[term] += 1

    document_count = len(documents)
    scores = {}

    for term, frequency in term_frequency.items():
        # Ignore extremely short/noisy terms.
        if len(term) < 3:
            continue

        # Lightweight TF-IDF calculation.
        tf = frequency / max(1, sum(term_frequency.values()))
        idf = math.log(
            (1 + document_count)
            / (1 + document_frequency.get(term, 0))
        ) + 1

        score = tf * idf

        # Slight preference for meaningful multi-word concepts.
        if " " in term:
            score *= 1.25

        scores[term] = score

    ranked = sorted(
        scores.items(),
        key=lambda item: (-item[1], item[0])
    )

    return [term for term, _ in ranked[:limit]]
