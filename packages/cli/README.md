# trusted-setup

A CLI for interacting with trusted setup backends. This tool is agnostic to any specific backend.

## Usage

`trusted-setup <backend-url>`

Join the trusted coordinated by a server at `backend-url`. The server is expected to implement an http and websocket server as well as some specific endpoints.
