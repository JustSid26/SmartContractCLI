use axum::{Json};
use serde::Serialize;

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
}
pub async fn health() -> Json<HealthResponse>{
    Json(HealthResponse {
        status: "running".to_string(),
    })
}