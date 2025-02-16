<h1 align="center">YABinPP: Yet Another Pastebin Plus</h1>

<p align="center">
    <a href="https://github.com/iidgg/YABinPP/blob/master/LICENSE">
        <img src="https://img.shields.io/github/license/iidgg/YABinPP.svg" alt="GitHub License" />
    </a>
    <img alt="Stars" src="https://img.shields.io/github/stars/iidgg/YABinPP" />
</p>

## Demo

![Demo Video](demo.webp)
This project is a fork of [YABin](https://github.com/Yureien/YABin) by [@Yureien](https://github.com/Yureien).

## Features

-   Modern and minimal UI (This site's design was inspired by bin).
-   Optional end-to-end encryption (we're using AES-256-GCM) with optional password protection (using PBKDF2).
-   Syntax highlighting (using Prism) that supports 297 languages.
-   API support to create and get pastes from command line.
-   View raw pastes. Normally, encrypted pastebins do not have this. With this site, you can either get the Base64-encoded encrypted paste, or decrypt it on the server side (even with the password) and get the raw paste.
-   Keyboard shortcuts!
-   And of course, being fully open-source and easily self-hostable.
-   Ability to edit pastes after creation, and a dashboard for viewing all your pastes.
-   **NEW** Feature to use custom path names.
-   **Comes with a CLI tool to create and read pastes from the command line!**

## API Documentation

See [API.md](API.md).

## CLI Usage

### Installation and Usage

```bash
pip install yabin
yabin create
yabin read "<URL>"
```

See [cli/README.md](cli/README.md) for detailed instructions and library usage.

## Setup

Quick docker-compose.yml setup:

```yml
networks:
    yabinpp-network:
        name: yabinpp-network
        ipam:
            driver: default

services:
    yabinpp:
        image: ghcr.io/iidgg/yabinpp
        ports:
            - 3000:3000/tcp
        environment:
            - DATABASE_URL=postgres://john:password@db/yabinpp
            - PUBLIC_URL=https://example.com # No trailing slash
        networks:
            - yabinpp-network
        depends_on:
            db:
                condition: service_healthy

    db:
        image: postgres:15-alpine
        healthcheck:
            interval: 5s
            timeout: 2s
            test: pg_isready -U ${DB_USER:-yabinpp_user} -d ${DB_NAME:-yabinpp_db}
        environment:
            - POSTGRES_USER=john
            - POSTGRES_PASSWORD=password
            - POSTGRES_DATABASE=yabinpp
        volumes:
            - ./db-data:/var/lib/postgresql/data
        networks:
            - yabinpp-network
```

## Public Instances

If you host one and want to make it public, just open an issue and I will add it here!

1. [bin.iduu.net](https://bin.iduu.net) ![Website Status](https://img.shields.io/website-up-down-green-red/https/bin.iduu.net.svg)
