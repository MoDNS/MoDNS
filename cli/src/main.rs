
use std::{path::PathBuf, net::Ipv4Addr};

use clap::{Parser, Subcommand};

fn main() {
    println!("{:?}", CLI::parse())
}

#[derive(Debug, Parser)]
struct CLI {

    #[command(subcommand)]
    command: CLICommand,

    /// Unix domain socket to use for communication with the modns daemon
    #[arg(short, long, default_value = "/tmp/modns.sock")]
    unix_socket: PathBuf,

    /// Show extra information in output
    #[arg(short, long, action=clap::ArgAction::Count)]
    verbose: u8,

    /// Control a modns daemon on another machine
    #[arg(short='H', long)]
    remote_host: Option<Ipv4Addr>,

    /// Port to use when contacting a daemon over http(s)
    #[arg(short, long)]
    remote_port: Option<u16>,

    #[arg(short='s', long, action = clap::ArgAction::SetTrue)]
    https: bool,

}

#[derive(Debug, Subcommand)]
enum CLICommand {

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
enum PluginCommand {
    List,
    Install {
        path: PathBuf
    },
    Uninstall {
        uuid: uuid::Uuid
    },
    Enable {
        uuid: uuid::Uuid
    },
    Disable {
        uuid: uuid::Uuid
    },
    GetConfig {
        uuid: uuid::Uuid,

        #[arg(action=clap::ArgAction::Append)]
        keys: Vec<String>
    },
    SetConfig {
        uuid: uuid::Uuid,

        key: String,
        value: String
    }
}

#[derive(Debug, Subcommand)]
enum ConfigCommand {
    Get {
        key: Vec<String>
    },
    
    Set {
        key: String,
        value: String
    }
}
