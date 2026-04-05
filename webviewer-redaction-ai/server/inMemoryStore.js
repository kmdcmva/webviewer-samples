// In-memory store for documents and analyses with TTL and max entry limits.
const DEFAULT_DOCUMENT_TTL_MS = 10 * 60 * 1000; // 10 minutes for raw documents to limit memory usage
const DEFAULT_ANALYSIS_TTL_MS = 10 * 60 * 1000; // 10 minutes for analyses to allow retrieval while still limiting memory usage
const DEFAULT_DOCUMENT_MAX_ENTRIES = 2;  // 2 documents is a reasonable default to prevent unbounded memory growth
const DEFAULT_ANALYSIS_MAX_ENTRIES = 2;  // 2 analyses is a reasonable default to prevent unbounded memory growth
const DEFAULT_CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute for periodic cleanup

// Helper function to parse positive integers with fallback
const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// In-memory store class definition
// This class manages two separate stores: one for raw documents and one for analysis results.
// Each store has its own TTL and max entry limits to balance memory usage and functionality.
// The store automatically prunes expired entries and enforces max entry limits on each access and via a periodic cleanup timer.
export default class InMemoryStore {
  constructor(options = {}) {
    // Load configuration from options or environment variables with defaults
    this.documentTtlMs = toPositiveInt(
      options.documentTtlMs ?? process.env.DOCUMENT_STORE_TTL_MS,
      DEFAULT_DOCUMENT_TTL_MS
    );
    // Analysis TTL can be the same as document TTL or different based on use case; using same default for simplicity
    this.analysisTtlMs = toPositiveInt(
      options.analysisTtlMs ?? process.env.ANALYSIS_STORE_TTL_MS,
      DEFAULT_ANALYSIS_TTL_MS
    );
    // Max entries can be configured separately for documents and analyses; using same default for simplicity
    this.documentMaxEntries = toPositiveInt(
      options.documentMaxEntries ?? process.env.DOCUMENT_STORE_MAX_ENTRIES,
      DEFAULT_DOCUMENT_MAX_ENTRIES
    );
    // Max entries can be configured separately for documents and analyses; using same default for simplicity
    this.analysisMaxEntries = toPositiveInt(
      options.analysisMaxEntries ?? process.env.ANALYSIS_STORE_MAX_ENTRIES,
      DEFAULT_ANALYSIS_MAX_ENTRIES
    );
    // Cleanup interval can be configured to control how often the store prunes expired entries and enforces max entry limits; using 1 minute as a reasonable default
    this.cleanupIntervalMs = toPositiveInt(
      options.cleanupIntervalMs ?? process.env.STORE_CLEANUP_INTERVAL_MS,
      DEFAULT_CLEANUP_INTERVAL_MS
    );

    // Internal stores for documents and analyses
    // Using Map to maintain insertion order which helps in enforcing max entry limits by removing oldest entries first
    this.documentStore = new Map();
    this.analysisStore = new Map();
    this.cleanupTimerStarted = false;
    this.startCleanupTimer();
  }

  // Store raw document text with a unique document ID and associated metadata such as text length. This method also ensures that the store is pruned of expired entries and does not exceed max entry limits after adding the new document.
  storeDocument(documentId, documentText) {
    this.upsertWithLimits(
      this.documentStore,
      documentId,
      {
        text: documentText,
        textLength: documentText.length
      },
      this.documentTtlMs,
      this.documentMaxEntries
    );
  }

  // Retrieve raw document text and metadata by document ID. This method also checks if the document has expired and prunes it if necessary before returning the result.
  getDocument(documentId) {
    return this.getStoreEntry(this.documentStore, documentId, this.documentTtlMs);
  }

  // Store analysis results for a document by document ID.
  // This method also ensures that the store is pruned of expired entries and does not exceed max entry limits after adding the new analysis.
  // Additionally, it releases the raw document text from memory once the analysis is stored to optimize memory usage, since the raw text is no longer needed after analysis is complete.
  storeAnalysis(documentId, analysisData) {
    this.upsertWithLimits(
      this.analysisStore,
      documentId,
      analysisData,
      this.analysisTtlMs,
      this.analysisMaxEntries
    );

    // Release potentially large raw text once analysis is complete.
    this.documentStore.delete(documentId);
  }

  // Retrieve analysis results by document ID.
  // This method also checks if the analysis has expired and prunes it if necessary before returning the result.
  getAnalysis(documentId) {
    return this.getStoreEntry(this.analysisStore, documentId, this.analysisTtlMs);
  }

  // Start the periodic cleanup timer to prune expired entries and enforce max entry limits.
  startCleanupTimer() {
    if (this.cleanupTimerStarted) {
      return;
    }

    // Set up a timer to periodically prune expired entries and enforce max entry limits for both document and analysis stores.
    // This helps to ensure that memory usage remains under control over time, even if some entries are not accessed frequently.
    const timer = setInterval(() => {
      this.pruneExpiredEntries(this.documentStore, this.documentTtlMs);
      this.pruneExpiredEntries(this.analysisStore, this.analysisTtlMs);
      this.enforceMaxEntries(this.documentStore, this.documentMaxEntries);
      this.enforceMaxEntries(this.analysisStore, this.analysisMaxEntries);
    }, this.cleanupIntervalMs);

    // Avoid keeping Node alive solely for periodic in-memory cleanup.
    if (typeof timer.unref === 'function') {
      timer.unref();
    }

    this.cleanupTimerStarted = true;
  }

  // Helper methods for managing store entries with TTL and max entry limits.
  setStoreEntry(store, key, value) {
    if (store.has(key)) {
      store.delete(key);
    }

    store.set(key, {
      value,
      storedAtMs: Date.now()
    });
  }

  // Retrieve a store entry by key, considering TTL.
  // If the entry has expired, it is removed from the store and null is returned.
  getStoreEntry(store, key, ttlMs) {
    const entry = store.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.storedAtMs > ttlMs) {
      store.delete(key);
      return null;
    }

    return entry.value;
  }

  // Prune expired entries from the store based on the provided TTL.
  // This method iterates through the store and removes any entries that have exceeded their TTL, helping to free up memory and ensure that stale data is not returned in future retrievals.
  pruneExpiredEntries(store, ttlMs) {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.storedAtMs > ttlMs) {
        store.delete(key);
      }
    }
  }

  // Enforce max entry limits on the store by removing the oldest entries first until the store size is within the specified limit.
  // This method helps to prevent unbounded memory growth by ensuring that only a certain number of entries are retained in the store at any given time, based on the configured max entry limits.
  enforceMaxEntries(store, maxEntries) {
    while (store.size > maxEntries) {
      const oldestKey = store.keys().next().value;
      if (!oldestKey) {
        break;
      }

      store.delete(oldestKey);
    }
  }

  // Upsert a store entry with TTL and max entry limits.
  // This method ensures that expired entries are pruned, the new entry is added, and the store does not exceed the specified max entries.
  upsertWithLimits(store, key, value, ttlMs, maxEntries) {
    this.pruneExpiredEntries(store, ttlMs);
    this.setStoreEntry(store, key, value);
    this.enforceMaxEntries(store, maxEntries);
  }
}
