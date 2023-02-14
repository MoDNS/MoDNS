
extern crate cbindgen;

use std::env;
use std::path::PathBuf;

fn main() {
    let crate_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());

    let defaults = cbindgen::Builder::new()
        .with_crate(&crate_dir)
        .with_namespace("modns_sdk")
        .with_include_guard("MODNS_SDK_H")
        .with_autogen_warning("/* Generated using cbindgen from the modns-sdk rust crate. Do not modify manually */");

    defaults.clone()
        .with_language(cbindgen::Language::C)
        .generate()
        .expect("Unable to generate C header file")
        .write_to_file(crate_dir.join("headers/modns-sdk.h"));

    defaults
        .with_language(cbindgen::Language::Cxx)
        .generate()
        .expect("Unable to generate C++ header file")
        .write_to_file(crate_dir.join("headers/modns-sdk.hpp"));
}