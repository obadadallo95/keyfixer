fn main() {
    println!("cargo:rustc-check-cfg=cfg(pro_private_exists)");
    let pro_inline_fix = std::path::Path::new("../pro-private/native/inline_fix.rs");
    if pro_inline_fix.exists() {
        println!("cargo:rustc-cfg=pro_private_exists");
    }
    println!("cargo:rerun-if-changed=../pro-private/native/inline_fix.rs");
    tauri_build::build();
}
