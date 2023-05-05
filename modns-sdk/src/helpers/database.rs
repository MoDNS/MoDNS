
use std::{path::Path, net::{SocketAddr, IpAddr}};

use crate::types::{safe, ffi::{self, ByteVector}, conversion::FfiVector};

pub const DEFAULT_POSTGRES_PORT: u16 = 5432;

pub enum DatabaseBackend {
    Sqlite,
    Postgres
}

impl safe::DatabaseInfo {

    /// Returns an enum representing the database backend
    pub fn backend(&self) -> DatabaseBackend {
        match self {
            safe::DatabaseInfo::Sqlite(_) => DatabaseBackend::Sqlite,
            safe::DatabaseInfo::Postgres{..} => DatabaseBackend::Postgres,
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
    pub fn addr(&self) -> Option<SocketAddr> {
        if let Self::Postgres{host, port, ..} = self {
            let ip = host.parse::<IpAddr>().ok()?;
            Some(SocketAddr::from((ip, *port)))
        } else {
            None
        }
    }

    /// Returns `Some` with the IP address for the database, unless the backend is SQLite
    pub fn host(&self) -> Option<&str> {
        if let Self::Postgres{host, ..} = self {
            Some(host)
        } else {
            None
        }
    }

    /// Returns `Some` with the port for the database, unless the backend is SQLite
    pub fn port(&self) -> Option<u16> {
        if let Self::Postgres{port, ..} = self {
            Some(*port)
        } else {
            None
        }
    }

    /// Similar to `port()`, but only returns `Some` if the default port for a particular
    /// backend has been overriden
    pub fn nonstandard_port(&self) -> Option<u16> {
        match self {
            safe::DatabaseInfo::Postgres{port, ..} if *port != DEFAULT_POSTGRES_PORT => Some(*port),
            _ => None
        }
    }
}

#[no_mangle]
pub extern "C" fn modns_get_database() -> Option<&'static ffi::DatabaseInfo> {
    super::get_database()
}

#[no_mangle]
pub extern "C" fn modns_get_plugin_dir() -> ByteVector {
    ByteVector::from_safe_vec(
        super::get_plugin_dir()
            .and_then(|p| p.to_str())
            .unwrap_or_default()
            .as_bytes()
            .into()
    )
}
