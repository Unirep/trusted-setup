# trusted-setup [![build badge](https://img.shields.io/circleci/build/github/Unirep/trusted-setup/main)](https://dl.circleci.com/status-badge/redirect/gh/Unirep/trusted-setup/tree/main)

A single server trusted setup ceremony system.

## Usage

This guide will assume you are using the pre-built frontend at [trusted-setup.com](https://trusted-setup.com). Here we will cover how to run a backend with custom circuits, text, and authentication methods.

### Getting started

First clone this repository. Through the rest of this we will assume you are working in the directory of this repository.

### Copying circuits

You will need the circuit zkeys you would like to apply contributions to, as well as the ptau file used to generate the circuits. Place these files in `packages/backend/circuits`. These can also be placed elsewhere, but we will assume they are at the previous path in this guide.

### Customizing the ceremony

In `packages/backend/src/config.mjs` there are a number of options that may be configured.

#### `authOptions`

This array specifies the methods by which a user may authenticate. The frontend will use this array to display options to the user. Each entry should have:

- `name`: A unique name to identify the authentication method
- `displayName`: The name that will be shown to the user
- `type`: The authentication method, either `none` or `oauth`
- `path`: The http path to for the user to begin authentication. This value is unused for authentication type `none`

#### `queues`

This array specifies the different queues that exist in the ceremony. Participants are taken from each queue in round robin fashion. If a queue has no entries (e.g. it's empty), the next queue will be taken from.

Each entry should have:

- `name`: The name of the queue, used internally
- `oauthRequire`: A where clause that will be used to determine if a user is eligibile to join a queue

#### `circuits`

This array specific the circuits that each participant may contribute to. Each entry should have:

- `name`: The name of the circuit, shown to the user
- `zkeyPath`: The path to the initial zkey file
- `ptauPath`: The path to the ptau file used to build the zkey

#### Timeouts

The ceremony includes a number of timing settings that should be adjusted based on the size/number of circuits in the ceremony.

- `KEEPALIVE_INTERVAL`: The rate at which each client in the queue must ping the server to stay in the queue (milliseconds)
- `CONTRIBUTION_TIMEOUT`: The maximum amount of time that may be spent building a contribution. Each participant must submit contributions in this window of time, otherwise they will be skipped. Note that this includes the time the server takes to _verify_ the contribution. (milliseconds)
- `PRUNE_INTERVAL`: The rate at which the server looks for timed out entries (milliseconds)

#### `WS_SERVER`

The url of the websocket server is used by the bootstrap http function. Servers connect to the http server to determine the address of the websocket server, and then connect to it.

#### OAuth identifiers

The backend supports Discord and Github based oauth by default. Each must have a `CLIENT_ID`, `CLIENT_SECRET`, and `REDIRECT_URI` defined. These values will be provided by Discord and Github developer settings for OAuth applications.

If you do not enable Discord/Github oauth in `authOptions` these values may be safely omitted. If these values are omitted attempting to oauth will safely return an error.

Note that these values should **not** be written directly in the file. Instead prefer supplying them as environment variables to avoid leakage in docker images.

#### Messages/icons

- `WELCOME_MESSAGE`: A message displayed in the CLI implementation upon starting
- `CEREMONY_DESCRIPTION`: A long form description displayed in the frontend
- `CEREMONY_IMAGE_PATH`: An image path, relative to the server, containing a square image that will be displayed in the web frontend. May be `null`
- `ATTESTATION_URL`: A path for users to attest to their contributions publicly. Will be shown as a link in the frontend. May be `null`

### Building the docker image

Once you have placed your circuit files and modified `config.mjs` you can build a docker image for the backend server using the following command (from the root directory of the project):

```sh
docker build . -t myorg/trusted-setup-backend:latest
```

To run the server with default ports use:

```sh
docker run -p 8000:8000 -p 8001:8001 myorg/trusted-setup-backend:latest
```

The http server should be available on port 8000, and the websocket server should be available on port 8001.
