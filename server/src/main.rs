use std::error::Error;

use futures::future::join;
use modnsd::listeners::{api::{ApiListener, self}, dns};
use tokio::net::{TcpListener, UnixListener};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {

    pretty_env_logger::init();

    let apiaddrs = vec![
        ApiListener::Tcp(TcpListener::bind(("0.0.0.0", 80)).await?), 
        ApiListener::Unix(UnixListener::bind("./modnsd.sock")?)
    ];

    join(api::listen_api(apiaddrs), dns::listen_dns("0.0.0.0:53".parse()?)).await.1?;

    Ok(())

}
