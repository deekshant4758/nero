use thiserror::Error;

#[derive(Debug, Error)]
pub enum CoreError {
    #[error("Event serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Invalid time range: from_ms ({from_ms}) >= to_ms ({to_ms})")]
    InvalidTimeRange {
        from_ms: i64,
        to_ms:   i64,
    },

    #[error("Session not found: {session_id}")]
    SessionNotFound { session_id: String },
}