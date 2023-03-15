use std::path::PathBuf;

use clap::Parser;

#[derive(Parser)]
#[command(name = "modnsd")]
pub struct ServerConfig {

    /// Directory to search for plugins.
    /// 
    /// On initialization, server will search this directory for
    /// subdirectories containing a `plugin.so` file and load them
    /// as plugins
    /// 
    /// Multiple directories can be specified
    #[arg(short, long, action=clap::ArgAction::Append)]
    #[arg(default_value=concat!(env!("CARGO_MANIFEST_DIR"), "/../plugins"))]
    plugin_path: Vec<PathBuf>,

    /// Path for the Unix Domain socket that is used by the CLI
    #[arg(short, long, default_value="./modnsd.sock")]
    socket_path: PathBuf,

    /// Don't immediately exit if the server is initialized into a state that would cause
    /// errors (ex: if there are no Listeners or Resolvers). Use this option if you want
    /// to use the CLI or web interface to troubleshoot
    #[arg(short, long, action=clap::ArgAction::SetTrue)]
    stay_alive: bool,
}

impl ServerConfig {
    pub fn plugin_path(&self) -> &[PathBuf] {
        self.plugin_path.as_ref()
    }

    pub fn socket_path(&self) -> &PathBuf {
        &self.socket_path
    }

    pub fn stay_alive(&self) -> bool {
        self.stay_alive
    }
}