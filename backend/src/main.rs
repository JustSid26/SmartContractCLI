mod routes;
mod errors;

use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

use routes::health::health;
use routes::validate::validate_contract;
#[tokio::main]
async fn main() {

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/validate", post(validate_contract))
        .layer(cors);

        let addr = SocketAddr::from(([0, 0, 0, 0], 3000));

    println!("Server running at http://{}", addr);

    axum::serve(
        tokio::net::TcpListener::bind(addr)
            .await
            .unwrap(),
        app,
    )
    .await
    .unwrap();
}