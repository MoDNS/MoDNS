use std::env;
use std::fmt::Debug;
use std::fs;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use clap::{Parser, ValueEnum};
use serde::{Deserialize, Serialize};

const PLUGIN_PATH_ENV: &str = "MODNS_PATH";
const UNIX_SOCKET_ENV: &str = "MODNS_UNIX_SOCKET";
const IGNORE_ERRS_ENV: &str = "MODNS_IGNORE_INIT_ERRORS";
const DATA_DIR_ENV: &str = "MODNS_DATA_DIR";
const LOG_ENV: &str = "MODNS_LOG";

const DEFAULT_PLUGIN_PATH: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../plugins");
const DEFAULT_UNIX_SOCKET: &str = "/tmp/modnsd.sock";
const DEFAULT_DATA_DIR: &str = "modns-data";

#[cfg(debug_assertions)]
const DEFAULT_LOG_FILTER: &str = "modnsd=trace,info";

#[cfg(not(debug_assertions))]
const DEFAULT_LOG_FILTER: &str = "info";

const DATA_DIR_FALLBACK_PARENT: &str = "/tmp";

const CONFIG_LOCKFILE_NAME: &str = "config-lock.yaml";

/// A modular DNS resolver
///
/// MoDNS is a DNS server that uses plugins to provide all functionality
///
/// This program is the server daemon. If you want to control an already running server, use `modns` instead
#[derive(Default, Debug, Parser, Clone, Deserialize)]
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
    plugin_path: Vec<PathBuf>,

    /// Path for the Unix Domain socket that is used by the CLI
    #[arg(short, long)]
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
    #[arg(short, long)]
    data_dir: Option<PathBuf>,

    /// Log level to output. Can be `error` (most severe), `warn`, `info`, `debug`, or `trace` (least severe).
    ///
    /// You can also specify filters per module, like `modnsd::listeners=debug,info` which sets the filter to
    /// `info` for all modules except `modnsd::listeners`. See documentation for the Rust `log` crate for more info.
    #[arg(short, long)]
    log: Option<String>,
}

impl ServerConfigBuilder {
    pub fn from_args() -> anyhow::Result<Self> {
        Self::try_parse().context("Failed to parse configuration from arguments")
    }

    pub fn from_yaml_file<P: AsRef<Path>>(config_file_path: P) -> anyhow::Result<Self> {
        let f =
            fs::read_to_string(config_file_path).context("Failed to read configuration file")?;
        serde_yaml::from_str(&f).context("Failed to parse configuration file")
    }

    pub fn from_env() -> Self {
        let plugin_path = env::var(PLUGIN_PATH_ENV)
            .ok()
            .unwrap_or_default()
            .split_terminator(":")
            .filter_map(|s| Some(PathBuf::from(s)))
            .collect();

        let unix_socket = env::var(UNIX_SOCKET_ENV)
            .ok()
            .and_then(|s| Some(PathBuf::from(s)));

        let ignore_init_errors = env::var(IGNORE_ERRS_ENV)
            .ok()
            .and_then(|s| IgnoreErrorsConfig::from_str(&s, true).ok());

        let data_dir = env::var(DATA_DIR_ENV)
            .ok()
            .and_then(|s| Some(PathBuf::from(s)));

        let log = env::var(LOG_ENV).ok();

        Self {
            plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
            log,
        }
    }

    pub fn merge(self, other: Self) -> Self {
        let Self {
            mut plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
            log,
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

        let log = match (log, other.log) {
            (Some(p), _) => Some(p),
            (None, Some(p)) => Some(p),
            (None, None) => None,
        };

        Self {
            plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
            log,
        }
    }

    fn reverse_merge(self, other: Self) -> Self {
        Self::merge(other, self)
    }

    fn build(mut self) -> anyhow::Result<ServerConfig> {

        // Get any unset configuration options from the lockfile
        if let Some(dir) = &self.data_dir {
            let lockfile = dir.join(CONFIG_LOCKFILE_NAME);

            if lockfile.exists() {
                self = self.reverse_merge(
                    ServerConfigBuilder::from_yaml_file(lockfile)
                        .context("Failed to parse configuration lockfile")?,
                );
            }
        }

        let Self {
            mut plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
            log,
        } = self;

        // Clean up the plugin path and ensure that there is at least one entry
        plugin_path.sort_unstable();
        plugin_path.dedup();

        if plugin_path.len() == 0 {
            plugin_path.push(
                PathBuf::from(DEFAULT_PLUGIN_PATH).canonicalize()
                .context("The plugin path was empty and the default plugin path was not found on this system")?
            )
        }

        // Get default values for any empty config values
        let unix_socket = unix_socket.unwrap_or(PathBuf::from(DEFAULT_UNIX_SOCKET));

        let ignore_init_errors = ignore_init_errors.unwrap_or_default();

        let data_dir = data_dir.unwrap_or_else(|| {
            env::current_dir()
                .unwrap_or(PathBuf::from(DATA_DIR_FALLBACK_PARENT))
                .join(DEFAULT_DATA_DIR)
        });

        let log = log.unwrap_or(String::from(DEFAULT_LOG_FILTER));

        // Build the configuration
        let conf = ServerConfig::new(plugin_path, unix_socket, ignore_init_errors, data_dir, log)?;

        // Create a lockfile
        conf.dump_to_file(conf.data_dir().join(CONFIG_LOCKFILE_NAME))?;

        Ok(conf)
    }
}

#[derive(Debug, Clone, Copy, ValueEnum, Default, Serialize, Deserialize)]
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
    Never,
}

#[derive(Debug, Serialize)]
pub struct ServerConfig {
    /// Directories to search for plugin directories
    plugin_path: Vec<PathBuf>,

    /// Path to the API's unix socket
    unix_socket: PathBuf,

    /// Setting the user chose of whether to ignore plugin initialization errors
    ignore_init_errors: IgnoreErrorsConfig,

    /// Directory to store persistent data files in
    data_dir: PathBuf,

    /// Filter to pass to logging crate
    log: String,
}

impl ServerConfig {
    pub fn new<P, U, D>(
        plugin_path: Vec<P>,
        unix_socket: U,
        ignore_init_errors: IgnoreErrorsConfig,
        data_dir: D,
        log: String,
    ) -> Result<Self> where
    P: AsRef<Path> + Debug,
    U: AsRef<Path> + Debug,
    D: AsRef<Path> + Debug,
    {

        // Get canonical paths for all plugin directories, creating any directories that don't exist
        let plugin_path = plugin_path.into_iter().map(|p| {

            if !p.as_ref().is_dir() {
                fs::create_dir_all(p.as_ref())
                .with_context(|| format!("Failed to create plugin directory at {}", p.as_ref().display()))?;
            };

            p.as_ref().canonicalize().with_context(|| format!("Plugin directory {} was not found", p.as_ref().display()))

        }).collect::<Result<Vec<PathBuf>>>()?;

        // Server will attempt to create unix socket, so we should make sure it doesn't exist, but the directory it's in does
        if unix_socket.as_ref().try_exists()
        .with_context(|| format!("Unable to check if unix socket {} exists", unix_socket.as_ref().display()))?
        {
            anyhow::bail!("Can't create a Unix socket at {} because an object already exists there", unix_socket.as_ref().display())
        }

        let unix_socket_dir = unix_socket.as_ref().parent().unwrap_or(Path::new("."));
        let unix_socket_file = unix_socket.as_ref().file_name().with_context(|| format!("Unix socket path {} does not appear to be a name for a file", unix_socket.as_ref().display()))?;

        if !unix_socket_dir.is_dir() {
            fs::create_dir_all(unix_socket_dir).with_context(|| format!("Couldn't create directory for unix socket {}", unix_socket.as_ref().display()))?;
        };

        let unix_socket = unix_socket_dir.canonicalize()
        .with_context(|| format!("Unix socket directory {} was not found", unix_socket_dir.display()))?
        .join(unix_socket_file);

        // Get canonical path for data directory, creating it if it doesn't exist
        if !data_dir.as_ref().is_dir() {
            fs::create_dir_all(&data_dir)
            .with_context(|| format!("Failed to create data directory at {}", data_dir.as_ref().display()))?;
        };

        let data_dir = data_dir.as_ref().canonicalize()
        .with_context(|| format!("Data directory {} was not found", data_dir.as_ref().display()))?;

        let new_conf = Self {
            plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
            log,
        };

        let lockfile = new_conf.data_dir.join(CONFIG_LOCKFILE_NAME);
        new_conf.dump_to_file(&lockfile)
        .with_context(|| format!("Failed to write configuration to lockfile {}", lockfile.display()))?;

        Ok(new_conf)
    }

    pub fn dump_to_file<P: AsRef<Path>>(&self, file_path: P) -> anyhow::Result<()> {
        let yaml_str = serde_yaml::to_string(self).context("Failed to serialize configuration")?;

        fs::write(file_path.as_ref(), yaml_str)
            .with_context(|| format!("Failed to write to {}", file_path.as_ref().display()))
    }

    pub fn plugin_path(&self) -> &[PathBuf] {
        self.plugin_path.as_ref()
    }

    pub fn unix_socket(&self) -> &Path {
        &self.unix_socket.as_ref()
    }

    pub fn strict_init(&self) -> bool {
        matches!(self.ignore_init_errors, IgnoreErrorsConfig::Never)
    }

    pub fn always_init(&self) -> bool {
        matches!(self.ignore_init_errors, IgnoreErrorsConfig::Always)
    }

    pub fn data_dir(&self) -> &Path {
        &self.data_dir.as_ref()
    }

    pub fn log(&self) -> &str {
        self.log.as_ref()
    }
}

pub fn init() -> anyhow::Result<ServerConfig> {
    ServerConfigBuilder::from_env()
    .merge(ServerConfigBuilder::from_args()?)
    .build()
}
