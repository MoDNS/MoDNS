use std::{path::{PathBuf, Path}, fs, env::{self, VarError}};

use anyhow::Context;
use clap::{Parser, ValueEnum};
use serde::Deserialize;

const PLUGIN_PATH_ENV: &str = "MODNS_PATH";
const UNIX_SOCKET_ENV: &str = "MODNS_UNIX_SOCKET";
const IGNORE_ERRS_ENV: &str = "MODNS_IGNORE_INIT_ERRORS";
const DATA_DIR_ENV: &str = "MODNS_DATA_DIR";

/// A modular DNS resolver
/// 
/// MoDNS is a DNS server that uses plugins to provide all functionality
/// 
/// This program is the server daemon. If you want to control an already running server, use `modns` instead
#[derive(Parser, Deserialize)]
#[command(name = "modnsd")]
pub struct ServerConfigBuilder {

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
    unix_socket: Option<PathBuf>,

    /// Ignore some, all, or no errors when initially loading plugins
    /// 
    /// By default, server will log an error and move on if a plugin fails to
    /// load, but if all plugins are loaded and the server is unable to handle
    /// DNS requests (most likely because there isn't a Resolver or Listener
    /// enabled), server will immediately exit with an error code
    #[arg(short, long, value_enum)]
    ignore_init_errors: Option<IgnoreErrorsConfig>,

    /// Path to the data directory
    #[arg(short, long, default_value="./modns-data")]
    data_dir: Option<PathBuf>

}

impl ServerConfigBuilder {
    pub fn from_args() -> anyhow::Result<Self> {
        Self::try_parse().context("Failed to parse configuration from arguments")
    }

    pub fn from_yaml_file<P: AsRef<Path>>(config_file_path: P) -> anyhow::Result<Self> {
        let f = fs::read_to_string(config_file_path).context("Failed to read configuration file")?;
        serde_yaml::from_str(&f).context("Failed to parse configuration file")

    }

    pub fn from_env() -> Self {

        let plugin_path = env::var(PLUGIN_PATH_ENV).ok()
        .unwrap_or_default()
        .split(":")
        .filter_map(|s| PathBuf::from(s).canonicalize().ok()).collect();

        let unix_socket = env::var(UNIX_SOCKET_ENV).ok()
        .and_then(|s| PathBuf::from(s).canonicalize().ok());

        let ignore_init_errors = env::var(IGNORE_ERRS_ENV).ok()
        .and_then(|s| IgnoreErrorsConfig::from_str(&s, true).ok());

        let data_dir = env::var(DATA_DIR_ENV).ok()
        .and_then(|s| PathBuf::from(s).canonicalize().ok());

        Self {
            plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
        }
    }

    pub fn merge(self, other: Self) -> Self {

        let Self {
            mut plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
        } = self;

        plugin_path.extend(other.plugin_path);

        let unix_socket = match (unix_socket, other.unix_socket) {
            (Some(p), _) => Some(p),
            (None, Some(p)) => Some(p),
            (None, None) => None,
        };

        let ignore_init_errors = match (ignore_init_errors, other.ignore_init_errors) {
            (Some(p), _) => Some(p),
            (None, Some(p)) => Some(p),
            (None, None) => None,
        };

        let data_dir = match (data_dir, other.data_dir) {
            (Some(p), _) => Some(p),
            (None, Some(p)) => Some(p),
            (None, None) => None,
        };

        Self {
            plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
        }

    }

    fn reverse_merge(self, other: Self) -> Self {
        Self::merge(other, self)
    }

    fn build(self) -> anyhow::Result<ServerConfig> {
        let Self {
            plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
        } = self;

        Ok(ServerConfig {
            plugin_path,
            unix_socket: unix_socket.unwrap_or(PathBuf::from("/tmp/modnsd.sock")),
            ignore_init_errors: ignore_init_errors.unwrap_or_default(),
            data_dir: data_dir.unwrap_or(PathBuf::from("./modns-data").canonicalize()?),
        })
    }
}

#[derive(Clone, Copy, ValueEnum, Default, Deserialize)]
pub enum IgnoreErrorsConfig {
    Always,
    #[default]
    Default,
    Never
}

pub struct ServerConfig {

    /// Directories to search for plugin directories
    plugin_path: Vec<PathBuf>,

    /// Path to the API's unix socket
    unix_socket: PathBuf,

    /// Setting the user chose of whether to ignore plugin initialization errors
    ignore_init_errors: IgnoreErrorsConfig,

    /// Directory to store persistent data files in
    data_dir: PathBuf,
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

pub fn init() -> anyhow::Result<ServerConfig> {

    ServerConfigBuilder::from_env()
    .merge(ServerConfigBuilder::from_args()?)
    .build()

}