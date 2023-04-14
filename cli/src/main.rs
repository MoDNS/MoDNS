
use std::path::{PathBuf, Path};

use clap::{Parser, Subcommand, Args};

mod util;
mod commands;

fn main() -> anyhow::Result<()> {

    let config = CLI::parse();

    if config.global_args().verbose() > 2 {
        println!("Parsed arguments: {config:#?}")
    }

    match config.command() {
        CLICommand::Plugin { command } => match command {
            PluginCommand::List { all }=> commands::plugins::list_plugins(&config.global_args(), *all),
            PluginCommand::Enable { name } => commands::plugins::set_enabled(name, true, config.global_args()),
            PluginCommand::Disable { name } => commands::plugins::set_enabled(name, false, config.global_args()),
            PluginCommand::GetConfig { name, keys } => commands::plugins::get_config(name, keys, config.global_args()),
            PluginCommand::SetConfig { name, key, value } => commands::plugins::set_config(name, key, value, config.global_args()),
            PluginCommand::Uninstall { name } => commands::plugins::uninstall(name, config.global_args()),
            _ => Err(anyhow::anyhow!("Not implemented"))
        },
        _ => Err(anyhow::anyhow!("Not implemented"))
    }

}

#[derive(Debug, Parser)]
pub struct CLI {

    #[command(subcommand)]
    command: CLICommand,

    #[clap(flatten)]
    global_args: CliOptions

}

impl CLI {
    pub fn command(&self) -> &CLICommand {
        &self.command
    }

    pub fn global_args(&self) -> &CliOptions {
        &self.global_args
    }
}

#[derive(Debug, Args)]
pub struct CliOptions {

    /// Unix domain socket to use for communication with the modns daemon
    #[arg(global = true)]
    #[arg(short, long, default_value = "/run/modnsd.sock")]
    unix_socket: PathBuf,

    /// Show extra information in output
    #[arg(global = true)]
    #[arg(short, long, action=clap::ArgAction::Count)]
    verbose: u8,

    /// Control a modns daemon on another machine
    #[arg(global = true)]
    #[arg(short='H', long)]
    remote_host: Option<String>,

    /// Port to use when contacting a daemon over http(s)
    #[arg(global = true)]
    #[arg(short, long)]
    remote_port: Option<u16>,

    #[arg(global = true)]
    #[arg(short='s', long, action = clap::ArgAction::SetTrue)]
    https: bool,

}

impl CliOptions {

    pub fn unix_socket(&self) -> &Path {
        &self.unix_socket.as_ref()
    }

    pub fn verbose(&self) -> u8 {
        self.verbose
    }

    pub fn remote_host(&self) -> Option<&str> {
        self.remote_host.as_deref()
    }

    pub fn remote_port(&self) -> Option<u16> {
        self.remote_port
    }

    pub fn https(&self) -> bool {
        self.https
    }
}

#[derive(Debug, Subcommand)]
pub enum CLICommand {

    /// Do things with plugins
    Plugin {
        #[command(subcommand)]
        command: PluginCommand
    },

    /// Get/set server configuration parameters
    Config {
        #[command(subcommand)]
        command: ConfigCommand
    },

    /// Restart the server
    Restart,

    /// Shut down the server
    Shutdown
}

#[derive(Debug, Subcommand)]
pub enum PluginCommand {
    List {
        #[arg(short, long, action=clap::ArgAction::SetTrue)]
        all: bool
    },
    Install {
        path: PathBuf
    },
    Uninstall {
        name: String
    },
    Enable {
        name: String
    },
    Disable {
        name: String
    },
    GetConfig {
        name: String,

        #[arg(action=clap::ArgAction::Append)]
        keys: Vec<String>
    },
    SetConfig {
        name: String,

        key: String,
        value: String
    }
}

#[derive(Debug, Subcommand)]
pub enum ConfigCommand {
    Get {
        key: Vec<String>
    },
    
    Set {
        key: String,
        value: String
    }
}
