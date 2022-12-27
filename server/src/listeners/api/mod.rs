
use actix_web::{App, HttpServer, middleware::Logger};
use actix_files;
use actix_web_lab::web as web_lab;
use std::net::SocketAddr;
use std::path::Path;

pub enum ApiAddr<'a> {
    Tcp(SocketAddr),
    Unix(&'a Path),
}

pub async fn runapi<'a>(listeners: Vec<ApiAddr<'a>>) -> std::io::Result<()> {

    let mut server = HttpServer::new(|| {
        App::new()
        .wrap(Logger::default())
        .service(web_lab::redirect("/", "/manage"))
        .service(actix_files::Files::new("/manage", "./web").index_file("index.html"))
        
    });

    for listener in listeners {
        server = match listener {
            ApiAddr::Tcp(l) => server.bind(l)?,

            #[cfg(unix)]
            ApiAddr::Unix(l) => server.bind_uds(l)?,

            #[cfg(not(unix))]
            ApiAddr::Unix(_) => server
        }
    };

    server.run().await
}