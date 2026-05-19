use thiserror::Error;

#[derive(Debug, Error)]
pub enum DbError {
	#[error("SQLite error: {0}")]
	Sqlite(#[from] rusqlite::Error),

	#[error("Serialization error: {0}")]
	Serialization(#[from] serde_json::Error),

	#[error("UUID parse error: {0}")]
	UuidParse(#[from] uuid::Error),

	#[error("Database path is invalid: {0}")]
	InvalidPath(String),

	#[error("Migration failed: {0}")]
	Migration(String),
}
