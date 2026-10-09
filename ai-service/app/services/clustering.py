import math
import re
from collections import Counter


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
    return [
        word
        for word in re.findall(
            r"[a-zA-Z][a-zA-Z0-9'-]{2,}",
            str(text).lower()
        )
        if word not in STOP_WORDS
    ]


def text_vector(text):
    """
    Create a normalized word-frequency vector using only Python.
    """
    words = tokenize(text)

    if not words:
        return {}

    counts = Counter(words)
    total = len(words)

    return {
        word: count / total
        for word, count in counts.items()
    }


def cosine_similarity(vector_a, vector_b):
    """
    Calculate cosine similarity between two sparse vectors.
    """
    if not vector_a or not vector_b:
        return 0.0

    common_words = set(vector_a) & set(vector_b)

    dot_product = sum(
        vector_a[word] * vector_b[word]
        for word in common_words
    )

    magnitude_a = math.sqrt(
        sum(value * value for value in vector_a.values())
    )

    magnitude_b = math.sqrt(
        sum(value * value for value in vector_b.values())
    )

    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0

    return dot_product / (magnitude_a * magnitude_b)


def cluster_texts(texts):
    """
    Lightweight deterministic text clustering.

    This replaces sklearn's TF-IDF + KMeans implementation.
    It groups evidence items when they have meaningful lexical
    similarity.

    No SciPy or scikit-learn dependency is required.
    """
    if not texts:
        return []

    if len(texts) < 2:
        return [
            {
                "cluster": 0,
                "items": list(range(len(texts)))
            }
        ]

    vectors = [
        text_vector(text)
        for text in texts
    ]

    clusters = []

    # Similarity threshold for grouping related evidence.
    similarity_threshold = 0.20

    for index, vector in enumerate(vectors):

        if not vector:
            # Empty/noisy evidence gets its own cluster.
            clusters.append({
                "cluster": len(clusters),
                "items": [index]
            })
            continue

        best_cluster = None
        best_similarity = 0.0

        for cluster in clusters:
            cluster_items = cluster["items"]

            similarities = [
                cosine_similarity(
                    vector,
                    vectors[item_index]
                )
                for item_index in cluster_items
            ]

            if similarities:
                similarity = sum(similarities) / len(similarities)

                if similarity > best_similarity:
                    best_similarity = similarity
                    best_cluster = cluster

        if (
            best_cluster is not None
            and best_similarity >= similarity_threshold
        ):
            best_cluster["items"].append(index)
        else:
            clusters.append({
                "cluster": len(clusters),
                "items": [index]
            })

    return clusters
