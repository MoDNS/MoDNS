use modnsd::listeners::api::{ApiListener, self};
use tokio::net::{TcpListener, UnixListener};

#[tokio::main]
async fn main() -> std::io::Result<()> {

    pretty_env_logger::init();

    let apiaddrs = vec![
        ApiListener::Tcp(TcpListener::bind(("0.0.0.0", 80)).await?), 
        ApiListener::Unix(UnixListener::bind("./modnsd.sock")?)
    ];

    api::listen_on(apiaddrs).await;

    Ok(())

}
