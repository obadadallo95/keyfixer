use std::env;
#[cfg(target_os = "macos")]
use std::process::Command;

fn main() {
    println!("cargo:rustc-check-cfg=cfg(storekit_native_exists)");

    #[cfg(target_os = "macos")]
    if env::var("CARGO_FEATURE_APPSTORE").is_ok() {
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
                "native/KeyFixerStoreKit.swift",
            ])
            .status()
            .expect("Failed to execute swiftc compiler");

        if status.success() {
            println!("cargo:rustc-link-search=native={}", out_dir);
            println!("cargo:rustc-link-lib=static=keyfixer_storekit");
            println!("cargo:rustc-link-lib=framework=StoreKit");
            println!("cargo:rustc-link-lib=framework=Foundation");
            println!("cargo:rustc-link-arg=-Wl,-rpath,/usr/lib/swift");
        } else {
            panic!("StoreKit Swift compilation failed!");
        }
    }

    tauri_build::build();
}
