use std::path::PathBuf;

use clap::{Parser, ValueEnum};

/// A modular DNS resolver
/// 
/// MoDNS is a DNS server that uses plugins to provide all functionality
/// 
/// This program is the server daemon. If you want to control an already running server, use `modns` instead
#[derive(Parser)]
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
    /// 
    /// By default, server will log an error and move on if a plugin fails to
    /// load, but if all plugins are loaded and the server is unable to handle
    /// DNS requests (most likely because there isn't a Resolver or Listener
    /// enabled), server will immediately exit with an error code
    #[arg(short, long, value_enum, default_value_t)]
    ignore_init_errors: IgnoreErrorsConfig,

    /// Path to the data directory
    #[arg(short, long, default_value="./modns-data")]
    data_dir: PathBuf

}

#[derive(Clone, Copy, ValueEnum, Default)]
pub enum IgnoreErrorsConfig {
    Always,
    #[default]
    Default,
    Never
}

impl ServerConfig {
    pub fn plugin_path(&self) -> &[PathBuf] {
        self.plugin_path.as_ref()
    }

    pub fn unix_socket(&self) -> &PathBuf {
        &self.unix_socket
    }

    pub fn ignore_init_errors(&self) -> IgnoreErrorsConfig {
        self.ignore_init_errors
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

    pub fn data_dir(&self) -> &PathBuf {
        &self.data_dir
    }
}