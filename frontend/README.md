# OLA backoffice (Angular 22)

The web UI of the OLA message service. Served by the Python service from `app/static/`.

## Develop (laptop)

```bash
# terminal 1: backend from the repo root
.venv/bin/uvicorn app.main:app --reload --port 8080
# terminal 2: frontend with hot reload, /api is proxied to :8080 (proxy.conf.json)
cd frontend && npm ci && npm start          # http://localhost:4200
```

Set a backoffice password once: `python -m app.cli set-password`.

## Release

Don't commit build output by hand. On GitHub run **Actions → Release frontend → Run workflow**.
It builds this folder and commits the bundle to `app/static/` on `main`. Then, on the server:
`git pull && sudo systemctl restart ola-service`.

A local `npm run build` writes to `frontend/dist/` (git-ignored).
