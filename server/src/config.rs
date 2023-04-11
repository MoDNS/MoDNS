use std::borrow::Borrow;
use std::fmt::Debug;
use std::fs;
use std::hash::Hash;
use std::net::{SocketAddr, IpAddr, Ipv4Addr};
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use clap::{Parser, ValueEnum};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use serde_json::{Value, Map};

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

const PLUGIN_PATH_KEY: &str = "plugin_path";
const DB_TYPE_KEY: &str = "db_type";
const DB_PATH_KEY: &str = "db_path";
const DB_ADDR_KEY: &str = "db_addr";
const DB_PORT_KEY: &str = "db_port";
const LOG_KEY: &str = "log_filter";

const DEFAULT_PLUGIN_PATH: &str = "/usr/share/modnsd/default-plugins";
const DEFAULT_UNIX_SOCKET: &str = "/run/modnsd.sock";
const DEFAULT_DATA_DIR: &str = "/var/lib/modnsd";
const DEFAULT_FRONTEND_DIR: &str = "/usr/share/modnsd/web";
const DEFAULT_SQLITE_FILE: &str = "modns.sqlite";
const DEFAULT_DB_ADDR: IpAddr = IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1));
const DEFAULT_MYSQL_PORT: u16 = 3306;
const DEFAULT_LOG_FILTER: &str = "info";

const CONFIG_LOCKFILE_NAME: &str = "config-lock.json";

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
    #[arg(short, long, env=UNIX_SOCKET_ENV, default_value=DEFAULT_UNIX_SOCKET)]
    unix_socket: PathBuf,

    /// Ignore some, all, or no errors when initially loading plugins
    ///
    /// By default, server will log an error and move on if a plugin fails to
    /// load, but if all plugins are loaded and the server is unable to handle
    /// DNS requests (most likely because there isn't a Resolver or Listener
    /// enabled), server will immediately exit with an error code
    #[arg(short, long, value_enum, env=IGNORE_ERRS_ENV, default_value_t)]
    ignore_init_errors: IgnoreErrorsConfig,

    /// Path to the data directory
    #[arg(short, long, env=DATA_DIR_ENV, default_value=DEFAULT_DATA_DIR)]
    data_dir: PathBuf,

    /// Path to the frontend root directory
    ///
    /// If a relative path is given, it will be expanded to that path relative to the persistent
    /// data directory (specified with --data-dir)
    #[arg(long, env=FRONTEND_DIR_ENV, default_value=DEFAULT_FRONTEND_DIR)]
    frontend_dir: PathBuf,

    /// Database backend to use, either SQLite (default) or MySql.
    #[arg(short='D', long, env=DB_TYPE_ENV)]
    database: Option<DatabaseBackend>,

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

    fn canonicalize_paths(self) -> Result<Self> {

        let Self {
            plugin_path,
            mut unix_socket,
            ignore_init_errors,
            data_dir,
            log,
            frontend_dir,
            database,
            sqlite_db_path,
            db_addr,
            db_port
        } = self;

        // Get canonical paths for all plugin directories, creating any directories that don't exist
        let mut plugin_path = plugin_path.into_iter().map(|p| {

            if !p.as_path().is_dir() {
                fs::create_dir_all(p.as_path())
                    .with_context(|| format!("Failed to create plugin directory at {}", p.as_path().display()))?;
            };

            p.as_path().canonicalize().with_context(|| format!("Plugin directory {} was not found", p.as_path().display()))

        }).collect::<Result<Vec<PathBuf>>>()?;

        // Ensure that no paths point to the same place
        plugin_path.sort_unstable();
        plugin_path.dedup();

        // Server will attempt to create unix socket, so we should make sure it doesn't exist, but the directory it's in does
        if unix_socket.as_path().try_exists()
            .with_context(|| format!("Unable to check if unix socket {} exists", unix_socket.as_path().display()))?
        {
            std::fs::remove_file(&unix_socket)
                .with_context(|| format!("Unix socket {} already exists and couldn't be removed", unix_socket.as_path().display()))?;
        }

        let unix_socket_dir = unix_socket.as_path().parent().unwrap_or(Path::new("."));
        let unix_socket_file = unix_socket.as_path().file_name().with_context(|| format!("Unix socket path {} does not appear to be a name for a file", unix_socket.as_path().display()))?;

        if !unix_socket_dir.is_dir() {
            fs::create_dir_all(unix_socket_dir).with_context(|| format!("Couldn't create directory for unix socket {}", unix_socket.as_path().display()))?;
        };

        unix_socket = unix_socket_dir.canonicalize()
            .with_context(|| format!("Unix socket directory {} was not found", unix_socket_dir.display()))?
            .join(unix_socket_file);



        // Get canonical path for data directory, creating it if it doesn't exist
        if !data_dir.as_path().is_dir() {
            fs::create_dir_all(&data_dir)
                .with_context(|| format!("Failed to create data directory at {}", data_dir.as_path().display()))?;
        };

        let data_dir = data_dir.as_path().canonicalize()
            .with_context(|| format!("Data directory {} was not found", data_dir.as_path().display()))?;

        let join_data_dir = |p: &Path| {
            if p.is_absolute() {
                p.canonicalize()
                    .with_context(|| format!("Directory {} was not found", p.display()))
            } else {
                let relative_path = data_dir.join(frontend_dir.as_path());

            relative_path.canonicalize()
                .with_context(|| format!("Frontend directory {} was not found", relative_path.display()))
            }
        };

        let frontend_dir = join_data_dir(frontend_dir.as_ref())?;

        Ok(Self {
            plugin_path,
            unix_socket,
            ignore_init_errors,
            data_dir,
            frontend_dir,
            database,
            sqlite_db_path,
            db_addr,
            db_port,
            log,
        })
    }
}

#[derive(Debug, Default, ValueEnum, Clone, Copy, Serialize, Deserialize)]
pub enum DatabaseBackend {
    #[default] Sqlite,
    Mysql,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DatabaseConfig {
    Sqlite(PathBuf),
    MySql(SocketAddr)
}

impl DatabaseConfig {

    /// Returns an enum representing the database backend
    pub fn backend(&self) -> DatabaseBackend {
        match self {
            DatabaseConfig::Sqlite(_) => DatabaseBackend::Sqlite,
            DatabaseConfig::MySql(_) => DatabaseBackend::Mysql,
        }
    }

    /// Returns `Some` with the path to the SQLite database file if the database backend is SQLite.
    pub fn path(&self) -> Option<&Path> {
        if let Self::Sqlite(p) = self {
            Some(p.as_path())
        } else {
            None
        }
    }

    /// Returns `Some` with the socket address for the database, unless the backend is SQLite
    pub fn addr(&self) -> Option<&SocketAddr> {
        if let Self::MySql(s) = self {
            Some(s)
        } else {
            None
        }
    }

    /// Returns `Some` with the IP address for the database, unless the backend is SQLite
    pub fn ip(&self) -> Option<IpAddr> {
        if let Self::MySql(s) = self {
            Some(s.ip())
        } else {
            None
        }
    }

    /// Returns `Some` with the port for the database, unless the backend is SQLite
    pub fn port(&self) -> Option<u16> {
        if let Self::MySql(s) = self {
            Some(s.port())
        } else {
            None
        }
    }

    /// Similar to `port()`, but only returns `Some` if the default port for a particular
    /// backend has been overriden
    pub fn nonstandard_port(&self) -> Option<u16> {
        match self {
            DatabaseConfig::Sqlite(_) => None,
            DatabaseConfig::MySql(s) if s.port() != DEFAULT_MYSQL_PORT => Some(s.port()),
            _ => None
        }
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

/// Configuration settings which can be modified at runtime, by the API.
///
/// Values are kept in a lockfile which is read at startup
#[derive(Debug)]
struct MutableServerConfig (Map<String, Value>);

impl Default for MutableServerConfig {
    fn default() -> Self {
        Self(Map::new())
    }
}

impl MutableServerConfig {

    fn read_lockfile(lockfile: impl AsRef<Path>) -> Result<Self> {

        if !lockfile.as_ref().exists() {
            return Ok(Self::default())
        }

        let f = fs::read_to_string(lockfile)
            .context("Failed to read configuration lockfile")?;

        Ok(Self(
            serde_json::from_str(&f)
                .context("Failed to parse configuration lockfile")?
        ))
    }

    pub fn write_lockfile(&self, lockfile: impl AsRef<Path>) -> Result<()> {
        let obj = serde_json::to_string(&self.0)
            .context("Failed to serialize configuration")?;

        fs::write(lockfile, obj)
            .context("Failed to write configuration lockfile")
    }

    fn get_config_obj<P: DeserializeOwned, Q>(&self, key: &Q) -> Option<P> where
        String: Borrow<Q>,
        Q: ?Sized + Ord + Eq + Hash
    {
        self.0.get(&key)
            .and_then(|v| serde_json::from_value(v.clone()).ok())
    }

    fn set_config_obj(&mut self, key: impl Into<String>, value: impl Serialize) -> Result<()> {
        let value = serde_json::to_value(value)?;

        self.0.insert(key.into(), value);

        Ok(())
    }

}

/// Getters & Setters
impl MutableServerConfig {

    fn plugin_path(&self) -> Option<Vec<PathBuf>> {
        self.get_config_obj(PLUGIN_PATH_KEY)
    }

    fn log(&self) -> Option<String> {
        self.get_config_obj(LOG_KEY)
    }

    fn db_type(&self) -> Option<DatabaseBackend> {
        self.get_config_obj(DB_TYPE_KEY)
    }

    fn db_path(&self) -> Option<PathBuf> {
        self.get_config_obj(DB_PATH_KEY)
    }

    fn db_addr(&self) -> Option<IpAddr> {
        self.get_config_obj(DB_ADDR_KEY)
    }

    fn db_port(&self) -> Option<u16> {
        self.get_config_obj(DB_PORT_KEY)
    }

    pub fn set_plugin_path(&mut self, plugin_path: Vec<PathBuf>) -> Result<()> {
        self.set_config_obj(PLUGIN_PATH_KEY, plugin_path)
    }

    pub fn set_db_type(&mut self, db_type: DatabaseBackend) -> Result<()>{
        self.set_config_obj(DB_TYPE_KEY, db_type)
    }

    pub fn set_db_path(&mut self, db_path: PathBuf) -> Result<()> {
        self.set_config_obj(DB_PATH_KEY, db_path)
    }

    pub fn set_db_addr(&mut self, db_addr: IpAddr) -> Result <()> {
        self.set_config_obj(DB_ADDR_KEY, db_addr)
    }

    pub fn set_db_port(&mut self, db_port: Option<u16>) -> Result<()> {
        self.set_config_obj(DB_PORT_KEY, db_port)
    }

    pub fn set_log(&mut self, log: String) -> Result<()> {
        self.set_config_obj(LOG_KEY, log)
    }
}

#[derive(Debug)]
pub struct ServerConfig {

    settings: MutableServerConfig,

    /// Directories to search for plugin directories
    override_plugin_path: Vec<PathBuf>,

    /// Path to the API's unix socket
    unix_socket: PathBuf,

    /// Setting the user chose of whether to ignore plugin initialization errors
    ignore_init_errors: IgnoreErrorsConfig,

    /// Directory to store persistent data files in
    data_dir: PathBuf,

    /// Filter to pass to logging crate
    override_log: Option<String>,

    frontend_dir: PathBuf,

    override_db_type: Option<DatabaseBackend>,

    override_db_path: Option<PathBuf>,

    override_db_addr: Option<IpAddr>,

    override_db_port: Option<u16>
}

impl ServerConfig {

    pub fn parse() -> Result<Self> {
        let overrides = ImmutableServerConfig::parse()
            .canonicalize_paths()?;

        let mutable = MutableServerConfig::read_lockfile(
            overrides.data_dir.join(CONFIG_LOCKFILE_NAME)
        )
        .unwrap_or_default();

        Ok(Self::new(overrides, mutable))
    }

    fn new(im: ImmutableServerConfig, mu: MutableServerConfig) -> Self {
        Self {
            settings: mu,
            override_plugin_path: im.plugin_path,
            unix_socket: im.unix_socket,
            ignore_init_errors: im.ignore_init_errors,
            data_dir: im.data_dir,
            override_log: im.log,
            frontend_dir: im.frontend_dir,
            override_db_type: im.database,
            override_db_path: im.sqlite_db_path,
            override_db_addr: im.db_addr,
            override_db_port: im.db_port,
        }
    }

    pub fn write_lockfile(&self, lockfile: impl AsRef<Path>) -> Result<()> {
        self.settings.write_lockfile(lockfile)
    }

}

impl ServerConfig {

    pub fn plugin_path(&self) -> Vec<PathBuf> {
        if self.override_plugin_path.len() > 0 {
            self.override_plugin_path.clone()
        } else {
            self.settings.plugin_path().unwrap_or_default()
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

    pub fn log(&self) -> String {
        self.override_log.clone()
            .or(self.settings.log())
            .unwrap_or(DEFAULT_LOG_FILTER.to_string())
    }

    pub fn frontend_dir(&self) -> &Path{
        &self.frontend_dir.as_path()
    }

    pub fn db_type(&self) -> DatabaseBackend {
        self.override_db_type
            .or(self.settings.db_type())
            .unwrap_or_default()
    }

    pub fn db_path(&self) -> PathBuf {
        self.override_db_path.clone()
            .or(self.settings.db_path())
            .unwrap_or(PathBuf::from(DEFAULT_SQLITE_FILE))
    }

    pub fn db_addr(&self) -> IpAddr {
        self.override_db_addr
            .or(self.settings.db_addr())
            .unwrap_or(DEFAULT_DB_ADDR)
    }

    pub fn db_port(&self) -> Option<u16> {
        self.override_db_port
            .or(self.settings.db_port())
    }

    pub fn db_info(&self) -> DatabaseConfig {
        match self.db_type() {
            DatabaseBackend::Sqlite => DatabaseConfig::Sqlite(
                self.db_path().to_path_buf()
            ),
            DatabaseBackend::Mysql => DatabaseConfig::MySql(
                SocketAddr::from((self.db_addr(), self.db_port().unwrap_or(DEFAULT_MYSQL_PORT)))
            ),
        }
    }
}

impl ServerConfig {
    pub fn set_plugin_path(&mut self, plugin_path: Vec<PathBuf>) -> Result<()> {
        self.settings.set_plugin_path(plugin_path)
    }

    pub fn set_db_type(&mut self, db_type: DatabaseBackend) -> Result<()> {
        self.settings.set_db_type(db_type)
    }

    pub fn set_db_path(&mut self, db_path: PathBuf) -> Result<()> {
        self.settings.set_db_path(db_path)
    }

    pub fn set_db_addr(&mut self, db_addr: IpAddr) -> Result<()> {
        self.settings.set_db_addr(db_addr)
    }

    pub fn set_db_port(&mut self, db_port: Option<u16>) -> Result<()> {
        self.settings.set_db_port(db_port)
    }

    pub fn set_log(&mut self, log: String) -> Result<()> {
        self.settings.set_log(log)
    }
}
