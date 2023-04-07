
use std::fmt::{Display, Debug};

use warp::{http::StatusCode, Reply, reply::Response};

#[derive(Debug)]
pub struct ApiResponse<S: Display + Debug + Send + Sync> (StatusCode, S);

impl<S: Display + Debug + Send + Sync> ApiResponse<S> {

    pub fn new(code: u16, msg: S) -> Self {
        Self (
            StatusCode::from_u16(code)
                .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR),
            msg
        )
    }

    pub fn msg(&self) -> &S {
        &self.1
    }

    pub fn code(&self) -> StatusCode {
        self.0
    }
}

impl<S: Display + Debug + Send + Sync> From<S> for ApiResponse<S> {
    fn from(msg: S) -> Self {
        Self::new(500, msg)
    }
}

impl<S: Display + Debug + Send + Sync> Display for ApiResponse<S> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.code(), self.msg())
    }
}

impl<T: Display + Debug + Send + Sync> Reply for ApiResponse<T> {
    fn into_response(self) -> warp::reply::Response {
        let mut resp = Response::new(self.msg().to_string().into());

        *resp.status_mut() = self.code();

        resp
    }
}
