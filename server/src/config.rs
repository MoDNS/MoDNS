use std::borrow::Borrow;
use std::fmt::Debug;
use std::fs;
use std::hash::Hash;
use std::net::{IpAddr, Ipv4Addr};
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use clap::{Parser, ValueEnum};
use modns_sdk::helpers::database::DEFAULT_POSTGRES_PORT;
use modns_sdk::types::safe;
use scrypt::Scrypt;
use scrypt::password_hash::rand_core::OsRng;
use scrypt::password_hash::{PasswordHasher, SaltString};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use serde_json::{Value, Map};

const PLUGIN_PATH_ENV: &str = "MODNS_PATH";
const NO_DEFAULT_PLUGINS_ENV: &str = "MODNS_NO_DEFAULT_PLUGINS";
const UNIX_SOCKET_ENV: &str = "MODNS_UNIX_SOCKET";
const IGNORE_ERRS_ENV: &str = "MODNS_IGNORE_INIT_ERRORS";
const DATA_DIR_ENV: &str = "MODNS_DATA_DIR";
const FRONTEND_DIR_ENV: &str = "MODNS_FRONTEND_DIR";
const DB_TYPE_ENV: &str = "MODNS_DB_TYPE";
const SQLITE_PATH_ENV: &str = "MODNS_DB_SQLITE_PATH";
const DB_ADDR_ENV: &str = "MODNS_DB_ADDR";
const DB_PORT_ENV: &str = "MODNS_DB_PORT";
const DB_USER_ENV: &str = "MODNS_DB_USER";
const DB_PASSWORD_ENV: &str = "MODNS_DB_PASSWORD";
const LOG_ENV: &str = "MODNS_LOG";
const ADMIN_PW_ENV: &str = "MODNS_ADMIN_PW";
const HEADLESS_ENV: &str = "MODNS_HEADLESS";
const API_PORT_ENV: &str = "MODNS_HTTP_PORT";
const HTTPS_ENV: &str = "MODNS_USE_HTTPS";
const TLS_CERT_ENV: &str = "MODNS_TLS_CERT";
const TLS_KEY_ENV: &str = "MODNS_TLS_KEY";

pub const PLUGIN_PATH_KEY: &str = "plugin_path";
pub const DB_TYPE_KEY: &str = "db_type";
pub const DB_PATH_KEY: &str = "sqlite_path";
pub const DB_ADDR_KEY: &str = "postgres_ip";
pub const DB_PORT_KEY: &str = "postgres_port";
pub const DB_USER_KEY: &str = "postgres_user";
pub const DB_PASS_KEY: &str = "postgres_pw";
pub const LOG_KEY: &str = "log_filter";
pub const ADMIN_PW_KEY: &str = "admin_pw";
pub const API_PORT_KEY: &str = "api_port";
pub const HTTPS_KEY: &str = "use_https";
pub const TLS_CERT_KEY: &str = "tls_cert_path";
pub const TLS_KEY_KEY: &str = "tls_key_path";
pub const ALL_KEY: &str = "all";

const DEFAULT_PLUGIN_PATH: &str = "/usr/share/modns/default-plugins";
const DEFAULT_UNIX_SOCKET: &str = "/run/modnsd.sock";
const DEFAULT_DATA_DIR: &str = "/var/lib/modns";
const DEFAULT_FRONTEND_DIR: &str = "/usr/share/modns/web";
const DEFAULT_SQLITE_FILE: &str = "modns.sqlite";
const DEFAULT_DB_ADDR: IpAddr = IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1));
const DEFAULT_POSTGRES_USER: &str = "postgres";
const DEFAULT_POSTGRES_PASS: &str = "postgres";
const DEFAULT_LOG_FILTER: &str = "info";
const DEFAULT_HTTP_PORT: u16 = 80;
const DEFAULT_HTTPS_PORT: u16 = 443;
const DEFAULT_HTTPS: bool = false;
const DEFAULT_TLS_CERT: &str = "/usr/share/modns/tls/default-cert.pem";
const DEFAULT_TLS_KEY: &str = "/usr/share/modns/tls/default-key.rsa";

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

    /// Disable default plugins
    ///
    /// Normally, default plugins (those distributed with MoDNS) are always included in the plugin
    /// path, regardless of settings provided by the user
    #[arg(long, action=clap::ArgAction::SetTrue, env=NO_DEFAULT_PLUGINS_ENV)]
    no_default_plugins: bool,

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

    #[arg(long, env=DB_USER_ENV)]
    db_user: Option<String>,

    #[arg(long, env=DB_PASSWORD_ENV)]
    db_password: Option<String>,

    /// Log level to output. Can be `error` (most severe), `warn`, `info`, `debug`, or `trace` (least severe).
    ///
    /// You can also specify filters per module, like `modnsd::listeners=debug,info` which sets the filter to
    /// `info` for all modules except `modnsd::listeners`. See documentation for the Rust `log` crate for more info.
    #[arg(short, long, env=LOG_ENV)]
    log: Option<String>,

    /// Override the administrator password
    #[arg(long, env=ADMIN_PW_ENV)]
    admin_password: Option<String>,

    /// Don't expose the web frontend
    #[arg(long, action=clap::ArgAction::SetTrue, env=HEADLESS_ENV)]
    headless: bool,

    /// Port to host the API and frontend on
    #[arg(long, env=API_PORT_ENV)]
    api_port: Option<u16>,

    /// Host the API and frontend on HTTPS
    #[arg(short='s', long, action=clap::ArgAction::SetTrue, env=HTTPS_ENV)]
    https: bool,

    /// The TLS certificate path to use for HTTPS
    ///
    /// If a relative path is given, it will be expanded to that path relative to the persistent
    /// data directory (specified with --data-dir)
    #[arg(long, env=TLS_CERT_ENV)]
    tls_cert: Option<PathBuf>,

    /// Path to the TLS key to use for HTTPS
    ///
    /// If a relative path is given, it will be expanded to that path relative to the persistent
    /// data directory (specified with --data-dir)
    #[arg(long, env=TLS_KEY_ENV)]
    tls_key: Option<PathBuf>,
}

impl ImmutableServerConfig {

    fn canonicalize_paths(self) -> Result<Self> {

        let Self {
        plugin_path,
        no_default_plugins,
        mut unix_socket,
        ignore_init_errors,
        data_dir,
        log,
        frontend_dir,
        database,
        sqlite_db_path,
        db_addr,
        db_port,
        db_user,
        db_password,
        admin_password,
        headless,
        api_port,
        https,
        tls_cert,
        tls_key
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

        let plugin_data_dir = data_dir.join("plugin_data");

        if !plugin_data_dir.is_dir() {
            fs::create_dir(data_dir.join("plugin_data"))
                .with_context(|| format!("Failed to create plugin data directory at {}", data_dir.join("plugin_data").display()))?;
        }

        let join_data_dir = |p: &Path| {
            if p.is_absolute() {
                p.canonicalize()
                    .with_context(|| format!("Directory {} was not found", p.display()))
            } else {
                let relative_path = data_dir.join(frontend_dir.as_path());

            relative_path.canonicalize()
                .with_context(|| format!("Directory {} was not found", relative_path.display()))
            }
        };

        let frontend_dir = if !headless {
            join_data_dir(frontend_dir.as_ref())?
        } else {
            PathBuf::new()
        };

        let admin_password = if let Some(p) = admin_password {
            let salt = SaltString::generate(&mut OsRng);
            Some(Scrypt.hash_password(p.as_bytes(), &salt)
                .context("Failed to hash admin password")?
                .to_string()
            )
        } else {
            None
        };

        Ok(Self {
            plugin_path,
            no_default_plugins,
            unix_socket,
            ignore_init_errors,
            data_dir,
            frontend_dir,
            database,
            sqlite_db_path,
            db_addr,
            db_port,
            db_user,
            db_password,
            log,
            admin_password,
            headless,
            api_port,
            https,
            tls_cert,
            tls_key,
        })
    }
}

#[derive(Debug, Default, ValueEnum, Clone, Copy, Serialize, Deserialize)]
pub enum DatabaseBackend {
    #[default] Sqlite,
    Postgres,
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
struct MutableServerConfig (Map<String, Value>, PathBuf);

impl MutableServerConfig {

    pub fn new(lockfile: impl AsRef<Path>) -> Result<Self> {
        let mut r = Self(Map::new(), lockfile.as_ref().to_path_buf());

        r.read_lockfile()?;

        Ok(r)
    }

    pub fn read_lockfile(&mut self) -> Result<()> {

        if !self.1.exists() {
            return Ok(())
        }

        let file_str = fs::read_to_string(&self.1)
            .context("Failed to read configuration lockfile")?;

        let mut lockfile_val = serde_json::from_str(&file_str)
            .context("Failed to parse configuration lockfile")?;

        self.0.append(&mut lockfile_val);

        Ok(())

    }

    pub fn write_lockfile(&self) -> Result<()> {
        let obj = serde_json::to_string(&self.0)
            .context("Failed to serialize configuration")?;

        fs::write(&self.1, obj)
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

        self.write_lockfile()?;

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

    fn db_user(&self) -> Option<String> {
        self.get_config_obj(DB_USER_KEY)
    }

    fn db_password(&self) -> Option<String> {
        self.get_config_obj(DB_PASS_KEY)
    }

    fn admin_pw_hash(&self) -> Option<String> {
        self.get_config_obj(ADMIN_PW_KEY)
    }

    fn https(&self) -> Option<bool> {
        self.get_config_obj(HTTPS_KEY)
    }

    fn api_port(&self) -> Option<u16> {
        self.get_config_obj(API_PORT_KEY)
    }

    fn tls_cert(&self) -> Option<PathBuf> {
        self.get_config_obj(TLS_CERT_KEY)
    }

    fn tls_key(&self) -> Option<PathBuf> {
        self.get_config_obj(TLS_KEY_KEY)
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

    pub fn set_db_user(&mut self, user: String) -> Result<()> {
        self.set_config_obj(DB_USER_KEY, user)
    }

    pub fn set_db_password(&mut self, password: String) -> Result<()> {
        self.set_config_obj(DB_PASS_KEY, password)
    }

    pub fn set_log(&mut self, log: String) -> Result<()> {
        self.set_config_obj(LOG_KEY, log)
    }

    pub fn set_admin_pw_hash(&mut self, pw: String) -> Result<()> {
        self.set_config_obj(ADMIN_PW_ENV, pw)
    }

    pub fn set_https(&mut self, https: Option<bool>) -> Result<()> {
        self.set_config_obj(HTTPS_KEY, https)
    }

    pub fn set_api_port(&mut self, port: Option<u16>) -> Result<()> {
        self.set_config_obj(API_PORT_KEY, port)
    }

    pub fn set_tls_cert(&mut self, path: Option<PathBuf>) -> Result<()> {
        self.set_config_obj(TLS_CERT_KEY, path)
    }

    pub fn set_tls_key(&mut self, path: Option<PathBuf>) -> Result<()> {
        self.set_config_obj(TLS_KEY_KEY, path)
    }
}

/// The server's configuration. Composed of immutable options which must be set when starting
/// the server, and immutable options which can be set at any time through the API.
#[derive(Debug)]
pub struct ServerConfig {

    settings: MutableServerConfig,

    /// Directories to search for plugin directories
    override_plugin_path: Vec<PathBuf>,

    no_default_plugins: bool,

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

    override_db_port: Option<u16>,

    override_db_user: Option<String>,

    override_db_pass: Option<String>,

    override_admin_pw_hash: Option<String>,

    headless: bool,

    override_api_port: Option<u16>,

    override_https: bool,

    override_tls_cert: Option<PathBuf>,

    override_tls_key: Option<PathBuf>,
}

impl ServerConfig {

    pub fn parse() -> Result<Self> {
        let overrides = ImmutableServerConfig::parse()
            .canonicalize_paths()?;

        let mutable = MutableServerConfig::new(
            overrides.data_dir.join(CONFIG_LOCKFILE_NAME)
        )?;

        Ok(Self::compose(overrides, mutable))
    }

    fn compose(im: ImmutableServerConfig, mu: MutableServerConfig) -> Self {
        Self {
            settings: mu,
            override_plugin_path: im.plugin_path,
            no_default_plugins: im.no_default_plugins,
            unix_socket: im.unix_socket,
            ignore_init_errors: im.ignore_init_errors,
            data_dir: im.data_dir,
            override_log: im.log,
            frontend_dir: im.frontend_dir,
            override_db_type: im.database,
            override_db_path: im.sqlite_db_path,
            override_db_addr: im.db_addr,
            override_db_port: im.db_port,
            override_db_user: im.db_user,
            override_db_pass: im.db_password,
            override_admin_pw_hash: im.admin_password,
            headless: im.headless,
            override_https: im.https,
            override_api_port: im.api_port,
            override_tls_cert: im.tls_cert,
            override_tls_key: im.tls_key,
        }
    }

    pub fn write_lockfile(&self) -> Result<()> {
        self.settings.write_lockfile()
    }

    pub fn new() -> Self {
        let im = ImmutableServerConfig::parse();
        let mu = MutableServerConfig(Map::new(), PathBuf::new());
        Self::compose(im, mu)
    }

    pub fn empty() -> Self {
        let im = ImmutableServerConfig::default();
        let mu = MutableServerConfig(Map::new(), PathBuf::new());
        Self::compose(im, mu)
    }

}

impl ServerConfig {

    pub fn plugin_path(&self) -> Vec<PathBuf> {
        let mut path = Vec::with_capacity(
            self.override_plugin_path.len() +
            self.settings.plugin_path().map(|v| v.len()).unwrap_or(0) +
            1
        );

        if !self.no_default_plugins {
            path.push(PathBuf::from(DEFAULT_PLUGIN_PATH));
        }

        path.extend_from_slice(&self.override_plugin_path);

        path.extend(
            self.settings.plugin_path()
                .unwrap_or_default()
                .into_iter()
                .filter(|p| {
                    !(self.override_plugin_path.contains(&p) || (!self.no_default_plugins && p == &PathBuf::from(DEFAULT_PLUGIN_PATH)))
                })
        );

        path
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
    
    pub fn db_path_absolute(&self) -> PathBuf {
        let p = self.db_path();

        if p.is_absolute() {
            p
        } else {
            self.data_dir().join(p)
        }
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

    pub fn db_user(&self) -> String {
        self.override_db_user.clone()
            .or(self.settings.db_user())
            .unwrap_or(DEFAULT_POSTGRES_USER.to_string())
    }

    pub fn db_password(&self) -> String {
        self.override_db_pass.clone()
            .or(self.settings.db_password())
            .unwrap_or(DEFAULT_POSTGRES_PASS.to_string())
    }

    pub fn db_info(&self) -> safe::DatabaseInfo {
        match self.db_type() {
            DatabaseBackend::Sqlite => safe::DatabaseInfo::Sqlite(
                self.db_path_absolute()
            ),
            DatabaseBackend::Postgres => safe::DatabaseInfo::Postgres{
                host: self.db_addr().to_string(),
                port: self.db_port().unwrap_or(DEFAULT_POSTGRES_PORT),
                username: self.db_user(),
                password: self.db_password(),
            },
        }
    }

    pub fn admin_pw_hash(&self) -> Option<String> {
        self.override_admin_pw_hash.clone()
            .or(self.settings.admin_pw_hash())
    }

    pub fn headless(&self) -> bool {
        self.headless
    }

    pub fn https(&self) -> bool {
        self.override_https
        || self.settings.https()
            .unwrap_or(DEFAULT_HTTPS)
    }

    pub fn api_port(&self) -> u16 {
        self.override_api_port
            .or(self.settings.api_port())
            .unwrap_or(if self.https() {
                DEFAULT_HTTPS_PORT
            } else {
                    DEFAULT_HTTP_PORT
                })
    }

    pub fn tls_cert(&self) -> PathBuf {
        self.override_tls_cert.clone()
            .or(self.settings.tls_cert())
            .unwrap_or(DEFAULT_TLS_CERT.into())
    }

    pub fn tls_key(&self) -> PathBuf {
        self.override_tls_key.clone()
            .or(self.settings.tls_key())
            .unwrap_or(DEFAULT_TLS_KEY.into())
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

    pub fn set_db_user(&mut self, user: String) -> Result<()> {
        self.settings.set_db_user(user)
    }

    pub fn set_db_password(&mut self, password: String) -> Result<()> {
        self.settings.set_db_password(password)
    }

    pub fn set_log(&mut self, log: String) -> Result<()> {
        self.settings.set_log(log)
    }
    
    pub fn set_admin_pw_hash(&mut self, pw: String) -> Result<()> {
        self.settings.set_admin_pw_hash(pw)
    }

    pub fn set_api_port(&mut self, port: Option<u16>) -> Result<()> {
        self.settings.set_api_port(port)
    }

    pub fn set_https(&mut self, https: Option<bool>) -> Result<()> {
        self.settings.set_https(https)
    }

    pub fn set_tls_cert(&mut self, path: Option<PathBuf>) -> Result<()> {
        self.settings.set_tls_cert(path)
    }

    pub fn set_tls_key(&mut self, path: Option<PathBuf>) -> Result<()> {
        self.settings.set_tls_key(path)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MutableConfigValue<T: Debug> {
    overridden: bool,
    value: T,
}

impl<T: Debug> MutableConfigValue<T> {
    // fn overridden(value: T) -> Self {
    //     Self {
    //         overridden: true,
    //         value
    //     }
    // }
    //
    // fn mutable(value: T) -> Self {
    //     Self {
    //         overridden: false,
    //         value
    //     } 
    // }

    pub fn is_overridden(&self) -> bool {
        self.overridden
    }

    pub fn value(&self) -> &T {
        &self.value
    }

    pub fn into_value(self) -> T {
        self.value
    }
}


/// Getters which include Override status
impl ServerConfig {
    pub fn query_db_type(&self) -> MutableConfigValue<DatabaseBackend> {
        MutableConfigValue {
            overridden: self.override_db_type.is_some(),
            value: self.db_type()
        }
    }

    pub fn query_db_path(&self) -> MutableConfigValue<PathBuf> {
        MutableConfigValue {
            overridden: self.override_db_path.is_some(),
            value: self.db_path()
        }
    }

    pub fn query_db_addr(&self) -> MutableConfigValue<IpAddr> {
        MutableConfigValue {
            overridden: self.override_db_addr.is_some(),
            value: self.db_addr()
        }
    }

    pub fn query_db_port(&self) -> MutableConfigValue<Option<u16>> {
        MutableConfigValue {
            overridden: self.override_db_port.is_some(),
            value: self.db_port()
        }
    }

    pub fn query_db_user(&self) -> MutableConfigValue<String> {
        MutableConfigValue { 
            overridden: self.override_db_user.is_some(),
            value: self.db_user()
        }
    }

    pub fn query_log(&self) -> MutableConfigValue<String> {
        MutableConfigValue {
            overridden: self.override_log.is_some(),
            value: self.log()
        }
    }

    pub fn query_admin_pw(&self) -> MutableConfigValue<()> {
        MutableConfigValue {
            overridden: self.override_admin_pw_hash.is_some(),
            value: ()
        }
    }

    pub fn query_api_port(&self) -> MutableConfigValue<u16> {
        MutableConfigValue {
            overridden: self.override_api_port.is_some(),
            value: self.api_port(),
        }
    }

    pub fn query_https(&self) -> MutableConfigValue<bool> {
        MutableConfigValue {
            overridden: self.override_https,
            value: self.https(),
        }
    }

    pub fn query_tls_cert(&self) -> MutableConfigValue<PathBuf> {
        MutableConfigValue {
            overridden: self.override_tls_cert.is_some(),
            value: self.tls_cert(),
        }
    }

    pub fn query_tls_key(&self) -> MutableConfigValue<PathBuf> {
        MutableConfigValue {
            overridden: self.override_tls_key.is_some(),
            value: self.tls_key(),
        }
    }

    pub fn query_plugin_path(&self) -> Vec<MutableConfigValue<PathBuf>> {
        self.plugin_path().into_iter().map(|p| {
            MutableConfigValue {
                overridden: self.override_plugin_path.contains(&p) || p == PathBuf::from(DEFAULT_PLUGIN_PATH),
                value: p
            }
        }).collect()
    }
}
