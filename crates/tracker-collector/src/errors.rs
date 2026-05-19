use thiserror::Error;

#[derive(Debug, Error)]
pub enum CollectorError {
    #[error("Platform error: {0}")]
    Platform(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Other: {0}")]
    Other(String),
}
