use std::env;
use std::path::Path;
use std::process::Command;

fn main() {
    println!("cargo:rustc-check-cfg=cfg(pro_private_exists)");
    println!("cargo:rustc-check-cfg=cfg(storekit_native_exists)");

    let pro_inline_fix = Path::new("../pro-private/native/inline_fix.rs");
    if pro_inline_fix.exists() {
        println!("cargo:rustc-cfg=pro_private_exists");
    }
    println!("cargo:rerun-if-changed=../pro-private/native/inline_fix.rs");

    let storekit_swift = Path::new("../pro-private/native/KeyFixerStoreKit.swift");
    println!("cargo:rerun-if-changed=../pro-private/native/KeyFixerStoreKit.swift");

    #[cfg(target_os = "macos")]
    if storekit_swift.exists() {
        println!("cargo:rustc-cfg=storekit_native_exists");
        let out_dir = env::var("OUT_DIR").unwrap();
        let lib_path = format!("{}/libkeyfixer_storekit.a", out_dir);

        let status = Command::new("swiftc")
            .args([
                "-emit-library",
                "-static",
                "-O",
                "-parse-as-library",
                "-o",
                &lib_path,
                "../pro-private/native/KeyFixerStoreKit.swift",
            ])
            .status();

        if let Ok(st) = status {
            if st.success() {
                println!("cargo:rustc-link-search=native={}", out_dir);
                println!("cargo:rustc-link-lib=static=keyfixer_storekit");
                println!("cargo:rustc-link-lib=framework=StoreKit");
                println!("cargo:rustc-link-lib=framework=Foundation");
            }
        }
    }

    tauri_build::build();
}
