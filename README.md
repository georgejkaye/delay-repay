# delay-repay

This is a web app for computing the amount of Delay Repay compensation one is
entitled to when travelling across multiple split tickets.

## Deployment

Set environment variables:

```sh
CLIENT_PORT=
# Optional, for traefik routing
CLIENT_HOST=
```

Then run with docker:

```sh
docker compose -f docker-compose.prod.yml up --build
```

## Development

Set environment variables:

```sh
CLIENT_PORT=
```

Then run with docker:

```sh
docker compose -f docker-compose.dev.yml up --build
```
