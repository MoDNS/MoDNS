use std::env;
use std::fmt::Debug;
use std::fs;
use std::net::{SocketAddr, IpAddr, Ipv4Addr};
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use clap::{Parser, ValueEnum};
use serde::{Deserialize, Serialize};

const PLUGIN_PATH_ENV: &str = "MODNS_PATH";
const UNIX_SOCKET_ENV: &str = "MODNS_UNIX_SOCKET";
const IGNORE_ERRS_ENV: &str = "MODNS_IGNORE_INIT_ERRORS";
const DATA_DIR_ENV: &str = "MODNS_DATA_DIR";
const FRONTEND_DIR_ENV: &str = "MODNS_FRONTEND_DIR";
const DB_TYPE_ENV: &str = "MODNS_DB_TYPE";
const SQLITE_PATH_ENV: &str = "MODNS_DB_SQLITE_PATH";
const DB_ADDR_ENV: &str = "MODNS_DB_ADDR";
const DB_PORT_ENV: &str = "MODNS_DB_PORT";
const LOG_ENV: &str = "MODNS_LOG";

const DEFAULT_PLUGIN_PATH: &str = "/usr/share/modnsd/default-plugins";
const DEFAULT_UNIX_SOCKET: &str = "/run/modnsd.sock";
const DEFAULT_DATA_DIR: &str = "/var/lib/modnsd";
const DEFAULT_FRONTEND_DIR: &str = "/usr/share/modnsd/web";
const DEFAULT_SQLITE_FILE: &str = "modns.sqlite";
const DEFAULT_DB_ADDR: IpAddr = IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1));
const DEFAULT_DB_PORT: u16 = 3306;
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
pub struct ImmutableServerConfig {
    /// Directory to search for plugins.
    ///
    /// On initialization, server will search this directory for
    /// subdirectories containing a `plugin.so` file and load them
    /// as plugins
    ///
    /// Multiple directories can be specified by using -p multiple times
    #[arg(short, long, action=clap::ArgAction::Append, env=PLUGIN_PATH_ENV)]
    plugin_path: Vec<PathBuf>,

    /// Path for the Unix Domain socket that is used by the CLI
    #[arg(short, long, env=UNIX_SOCKET_ENV)]
    unix_socket: Option<PathBuf>,

    /// Ignore some, all, or no errors when initially loading plugins
    ///
    /// By default, server will log an error and move on if a plugin fails to
    /// load, but if all plugins are loaded and the server is unable to handle
    /// DNS requests (most likely because there isn't a Resolver or Listener
    /// enabled), server will immediately exit with an error code
    #[arg(short, long, value_enum, env=IGNORE_ERRS_ENV)]
    ignore_init_errors: Option<IgnoreErrorsConfig>,

    /// Path to the data directory
    #[arg(short, long, env=DATA_DIR_ENV)]
    data_dir: Option<PathBuf>,

    /// Path to the frontend root directory
    ///
    /// If a relative path is given, it will be expanded to that path relative to the persistent
    /// data directory (specified with --data-dir)
    #[arg(long, env=FRONTEND_DIR_ENV)]
    frontend_dir: Option<PathBuf>,

    /// Database backend to use, either SQLite (default) or MySql.
    #[arg(short='D', long, env=DB_TYPE_ENV)]
    database: Option<DatabaseArg>,

    /// If using SQLite as the database, the path to the database file
    ///
    /// If a relative path is given, it will be expanded to that path relative to the data
    /// directory (specified with --data-dir)
    #[arg(long, env=SQLITE_PATH_ENV)]
    sqlite_db_path: Option<PathBuf>,

    /// Address for the MySQL database
    ///
    /// Only applies if --databse=mysql argument is used
    #[arg(long, env=DB_ADDR_ENV)]
    db_addr: Option<IpAddr>,

    /// Port for the MySQL database
    ///
    /// Only applies if --database=mysql argument is used
    #[arg(long, env=DB_PORT_ENV)]
    db_port: Option<u16>,

    /// Log level to output. Can be `error` (most severe), `warn`, `info`, `debug`, or `trace` (least severe).
    ///
    /// You can also specify filters per module, like `modnsd::listeners=debug,info` which sets the filter to
    /// `info` for all modules except `modnsd::listeners`. See documentation for the Rust `log` crate for more info.
    #[arg(short, long, env=LOG_ENV)]
    log: Option<String>,
}

impl ImmutableServerConfig {

    fn from_args() -> anyhow::Result<Self> {
        Self::try_parse().context("Failed to parse configuration from arguments")
    }

    fn build(self) -> Result<ServerConfig> {

        let Self {
            plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
            log,
            frontend_dir,
            database,
            sqlite_db_path,
            db_addr,
            db_port
        } = self;

        // Get default values for any empty config values
        let unix_socket = unix_socket.unwrap_or(PathBuf::from(DEFAULT_UNIX_SOCKET));

        let ignore_init_errors = ignore_init_errors.unwrap_or_default();

        let data_dir = data_dir.unwrap_or_else(|| {
            env::current_dir()
                .unwrap_or(PathBuf::from(DATA_DIR_FALLBACK_PARENT))
                .join(DEFAULT_DATA_DIR)
        });

        let log = log.unwrap_or(String::from(DEFAULT_LOG_FILTER));

        let frontend_dir = frontend_dir.unwrap_or(PathBuf::from(DEFAULT_FRONTEND_DIR));

        let sqlite_db_path = sqlite_db_path.unwrap_or(PathBuf::from(DEFAULT_SQLITE_FILE));

        let db_addr = db_addr.unwrap_or(DEFAULT_DB_ADDR);

        let db_port = db_port.unwrap_or(DEFAULT_DB_PORT);

        let db_info = match database {
            Some(DatabaseArg::Sqlite) => {
                Some(DatabaseConfig::Sqlite(sqlite_db_path))
            },
            Some(_) => {
                Some(DatabaseConfig::MySql(
                    SocketAddr::from((db_addr, db_port))
                ))
            },
            None => None
        };

        // Build the configuration
        let conf = ServerConfig::new(plugin_path, unix_socket, ignore_init_errors, data_dir, log, frontend_dir, db_info)?;

        Ok(conf)
    }
}

#[derive(Debug, Default, ValueEnum, Clone, Copy, Deserialize)]
enum DatabaseArg {
    #[default] Sqlite,
    Mysql,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DatabaseConfig {
    Sqlite(PathBuf),
    MySql(SocketAddr)
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

/// Configuration settings which can be modified at runtime, by the API.
///
/// Values are kept in a lockfile which is read at startup
#[derive(Debug, Serialize, Deserialize)]
struct MutableServerConfig {

    plugin_path: Vec<PathBuf>,

    db_info: DatabaseConfig,
}

impl MutableServerConfig {

    fn new(data_dir: impl AsRef<Path>) -> Self {
        Self {
            plugin_path: Vec::new(),
            db_info: DatabaseConfig::Sqlite(data_dir.as_ref().join(DEFAULT_SQLITE_FILE)),
        }
    }

    fn read_lockfile(lockfile: impl AsRef<Path>) -> Result<Self> {
        let f = fs::read_to_string(lockfile)
            .context("Failed to read configuration lockfile")?;
        serde_json::from_str(&f)
            .context("Failed to parse configuration lockfile")
    }

    fn write_lockfile(&self, lockfile: impl AsRef<Path>) -> Result<()> {
        let obj = serde_json::to_string(self)
            .context("Failed to serialize configuration")?;

        fs::write(lockfile, obj)
            .context("Failed to write configuration lockfile")
    }

    fn plugin_path(&self) -> &[PathBuf] {
        self.plugin_path.as_ref()
    }

    fn db_info(&self) -> &DatabaseConfig {
        &self.db_info
    }
}

#[derive(Debug, Serialize)]
pub struct ServerConfig {

    settings: MutableServerConfig,

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

    frontend_dir: PathBuf,

    db_info: Option<DatabaseConfig>,
}

impl ServerConfig {
    fn new(
        plugin_path: Vec<impl AsRef<Path>>,
        unix_socket: impl AsRef<Path>,
        ignore_init_errors: IgnoreErrorsConfig,
        data_dir: impl AsRef<Path>,
        log: String,
        frontend_dir: impl AsRef<Path>,
        db_info: Option<DatabaseConfig>,
    ) -> Result<Self> {

        // Get canonical paths for all plugin directories, creating any directories that don't exist
        let mut plugin_path = plugin_path.into_iter().map(|p| {

            if !p.as_ref().is_dir() {
                fs::create_dir_all(p.as_ref())
                    .with_context(|| format!("Failed to create plugin directory at {}", p.as_ref().display()))?;
            };

            p.as_ref().canonicalize().with_context(|| format!("Plugin directory {} was not found", p.as_ref().display()))

        }).collect::<Result<Vec<PathBuf>>>()?;

        // Ensure that no paths point to the same place
        plugin_path.sort_unstable();
        plugin_path.dedup();

        // Server will attempt to create unix socket, so we should make sure it doesn't exist, but the directory it's in does
        if unix_socket.as_ref().try_exists()
            .with_context(|| format!("Unable to check if unix socket {} exists", unix_socket.as_ref().display()))?
        {
            std::fs::remove_file(unix_socket.as_ref())
                .with_context(|| format!("Unix socket {} already exists and couldn't be removed", unix_socket.as_ref().display()))?;
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

        let join_data_dir = |p: &Path| {
            if p.is_absolute() {
                p.canonicalize()
                    .with_context(|| format!("Directory {} was not found", p.display()))
            } else {
                let relative_path = data_dir.join(frontend_dir.as_ref());

            relative_path.canonicalize()
                .with_context(|| format!("Frontend directory {} was not found", relative_path.display()))
            }
        };

        let frontend_dir = join_data_dir(frontend_dir.as_ref())?;

        let db_info = match db_info {
            Some(DatabaseConfig::Sqlite(p)) => {
                Some(DatabaseConfig::Sqlite(join_data_dir(p.as_ref())?))
            },
            Some(DatabaseConfig::MySql(a)) => {
                Some(DatabaseConfig::MySql(a))
            },
            None => None
        };

        let settings = MutableServerConfig::read_lockfile(data_dir.join(CONFIG_LOCKFILE_NAME))
            .unwrap_or_else(|e| {
                log::warn!("Failed to read configuration lockfile in {}, falling back to default options", data_dir.display());
                log::debug!("Error: {e:#?}");
                MutableServerConfig::new(&data_dir)
            });

        let new_conf = Self {
            settings,
            plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
            log,
            frontend_dir,
            db_info,
        };

        Ok(new_conf)
    }

}

impl ServerConfig {

    pub fn plugin_path(&self) -> &[PathBuf] {
        if self.plugin_path.len() > 0 {
            self.plugin_path.as_ref()
        } else {
            self.settings.plugin_path()
        }
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

    pub fn frontend_dir(&self) -> &Path{
        &self.frontend_dir.as_path()
    }

    pub fn db_info(&self) -> &DatabaseConfig {
        self.db_info
            .as_ref()
            .unwrap_or(self.settings.db_info())
    }
}

pub fn init() -> Result<ServerConfig> {
    ImmutableServerConfig::from_args()?
        .build()
}
