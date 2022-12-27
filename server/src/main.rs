use modnsd::listeners::api::{ApiAddr, runapi};
use std::net::SocketAddr;
use std::path::Path;

#[tokio::main]
async fn main() -> std::io::Result<()>{

    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let apiaddrs = vec![ApiAddr::Tcp(SocketAddr::from(([0, 0, 0, 0], 80))), ApiAddr::Unix(&Path::new("/app/modnsd.sock"))];

    runapi(apiaddrs).await

}
