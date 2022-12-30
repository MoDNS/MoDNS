
#Use cargo-chef to build dependencies separately from main binary
FROM lukemathwalker/cargo-chef:0.1.50-rust-1.66.0-bullseye AS chef

WORKDIR /builder

#Prepare a list of dependencies
FROM chef AS prepare-cli

COPY cli .

RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS build-cli

COPY --from=prepare-cli /builder/recipe.json recipe.json

RUN cargo chef cook --release --recipe-path recipe.json

COPY cli/src src

RUN touch src/main.rs

RUN cargo build --release

FROM chef AS prepare-daemon

COPY server .

RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS build-daemon

COPY --from=prepare-daemon /builder/recipe.json recipe.json

RUN cargo chef cook --release --recipe-path recipe.json

COPY server/src src

RUN touch src/main.rs

RUN cargo build --release

FROM node:19 AS build-frontend

WORKDIR /builder

COPY frontend/dns_frontend/package.json frontend/dns_frontend/package-lock.json ./

RUN npm ci

COPY frontend/dns_frontend .

RUN npm run build

#Finally, copy server over to a bare image to reduce bulk of final image
FROM debian:buster-slim AS runtime

EXPOSE 80

WORKDIR /app

ENV PATH "${PATH}:/app"

COPY --from=build-cli /builder/target/release/modns .

COPY --from=build-daemon /builder/target/release/modnsd .

COPY --from=build-frontend /builder/build web

#Rocket needs Rocket.toml config file in its runtime environment
ENTRYPOINT [ "modnsd" ]