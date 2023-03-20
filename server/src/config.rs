use std::path::{PathBuf, Path};

use clap::{Parser, ValueEnum};

/// A modular DNS resolver
/// 
/// MoDNS is a DNS server that uses plugins to provide all functionality
/// 
/// This program is the server daemon. If you want to control an already running server, use `modns` instead
#[derive(Default, Parser, Debug, Clone)]
#[command(name = "modnsd")]
pub struct ServerConfig {

    /// Directory to search for plugins.
    /// 
    /// On initialization, server will search this directory for
    /// subdirectories containing a `plugin.so` file and load them
    /// as plugins
    /// 
    /// Multiple directories can be specified by using -p multiple times
    #[arg(short, long, action=clap::ArgAction::Append)]
    #[arg(default_value=concat!(env!("CARGO_MANIFEST_DIR"), "/../plugins"))]
    plugin_path: Vec<PathBuf>,

    /// Path for the Unix Domain socket that is used by the CLI
    #[arg(short, long, default_value="/tmp/modnsd.sock")]
    unix_socket: PathBuf,

    /// Ignore some, all, or no errors when initially loading plugins
    #[arg(short, long, value_enum, default_value_t)]
    ignore_init_errors: IgnoreErrorsConfig,

    /// Path to the data directory
    #[arg(short, long, default_value="./modns-data")]
    data_dir: PathBuf,

    /// Log level to output. Can be `error` (most severe), `warn`, `info`, `debug`, or `trace` (least severe).
    /// 
    /// You can also specify filters per module, like `modnsd::listeners=debug,info` which sets the filter to
    /// `info` for all modules except `modnsd::listeners`. See documentation for the Rust `log` crate for more info.
    #[arg(short, long, default_value_t)]
    #[cfg_attr(debug_assertions, arg(default_value="modnsd=trace,info"))]
    log: String


}

#[derive(Debug, Clone, Copy, ValueEnum, Default)]
pub enum IgnoreErrorsConfig {

    /// Always start the server, even if it will be unable to resolve DNS requests.
    /// This option is typically useful when attempting to troubleshoot via the CLI
    /// or web interface.
    Always,

    /// Start the server even if there are errors, but exit if plugin initialization
    /// doesn't find a listener or resolver (since the server would be unable to
    /// resolve requests in this state)
    #[default]
    Sometimes,

    /// Exit immediately upon encountering any error while loading plugins
    Never
}

impl ServerConfig {
    pub fn plugin_path(&self) -> &[PathBuf] {
        self.plugin_path.as_ref()
    }

    pub fn unix_socket(&self) -> &Path {
        &self.unix_socket.as_ref()
    }

    pub fn strict_init(&self) -> bool {
        if let IgnoreErrorsConfig::Never = self.ignore_init_errors {
            true
        } else {
            false
        } 
    }

    pub fn always_init(&self) -> bool {
        if let IgnoreErrorsConfig::Always = self.ignore_init_errors {
            true
        } else {
            false
        } 
    }

    pub fn data_dir(&self) -> &Path {
        &self.data_dir.as_ref()
    }

    pub fn log(&self) -> &str {
        self.log.as_ref()
    }
}