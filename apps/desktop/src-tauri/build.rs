fn main() {
    let manifest_dir = std::env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR is not set");
    let frontend_dist = std::path::Path::new(&manifest_dir).join("../dist");

    let _ = std::fs::create_dir_all(&frontend_dist);

    tauri_build::build()
}