# Portfolio — Rails 8 on Synology NAS

A Ruby on Rails 8 portfolio site with PostgreSQL, hosted on a Synology NAS using Docker, exposed to the internet via Cloudflare Tunnel.

Live at: **https://jknight.uk**

---

## Stack

- **Ruby** 3.4.9
- **Rails** 8.1.3
- **PostgreSQL** 16 (Docker container on Synology)
- **Propshaft** (asset pipeline)
- **Bootstrap** (CSS)
- **jQuery** (via importmap)
- **Puma** (web server)
- **Docker** (containerised deployment)
- **Cloudflare Tunnel** (HTTPS, no open router ports)

---

## Development Setup (Windows + WSL2)

### Prerequisites

- Windows 10/11 with WSL2 (Ubuntu)
- Docker Desktop for Windows (WSL2 backend enabled)
- mise (Ruby version manager)

### Install Ruby via mise

```bash
mise install ruby@3.4.9
mise use --global ruby@3.4.9
ruby -v
```

### Install Rails and dependencies

```bash
gem install rails -v 8.1.3 --no-document

# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Yarn
sudo npm install -g yarn

# PostgreSQL client libraries
sudo apt install -y libpq-dev postgresql-client
```

### Create the app

```bash
rails new Portfolio \
  --database=postgresql \
  --asset-pipeline=propshaft \
  --javascript=importmap \
  --css=bootstrap
```

### jQuery setup

In `config/importmap.rb`:

```ruby
pin "jquery", to: "https://ga.jspm.io/npm:jquery@3.7.1/dist/jquery.js"
pin "jquery_ujs", to: "https://ga.jspm.io/npm:jquery-ujs@1.2.3/src/rails.js"
```

In `app/javascript/application.js`:

```js
import "jquery"
import "jquery_ujs"
```

### VS Code Extensions

- Ruby LSP (Shopify)
- ERB Helper Tags
- Bootstrap 5 & Font Awesome Snippets

> **Important:** Open the project via `code .` from WSL terminal to ensure VS Code runs in WSL mode (check bottom left shows `WSL: Ubuntu`).

---

## Synology NAS Setup

### Requirements

- Synology DSM with **Container Manager** installed
- SSH enabled: Control Panel → Terminal & SNMP → Terminal

### Docker containers on the NAS

Three containers run on the Synology:

| Container | Image | Port |
|-----------|-------|------|
| postgres | postgres:16 | 5433 (5432 was taken by native Postgres) |
| registry | registry | 5050 |
| cloudflared | cloudflare/cloudflared | — |
| portfolio | (synology.ip):5050/portfolio | 3000 |

### PostgreSQL container

`/volume1/docker/postgres/docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: postgres
    environment:
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: <your_password>
      POSTGRES_DB: portfolio_production
    volumes:
      - /volume1/docker/postgres/data:/var/lib/postgresql/data
    ports:
      - 5433:5432
    restart: unless-stopped
```

```bash
cd /volume1/docker/postgres
sudo docker-compose up -d
```

### Create databases

```bash
sudo docker exec -it postgres psql -U portfolio -d postgres -c "CREATE DATABASE portfolio_production;"
sudo docker exec -it postgres psql -U portfolio -d postgres -c "CREATE DATABASE portfolio_production_cache;"
sudo docker exec -it postgres psql -U portfolio -d postgres -c "CREATE DATABASE portfolio_production_queue;"
sudo docker exec -it postgres psql -U portfolio -d postgres -c "CREATE DATABASE portfolio_production_cable;"
```

### Local Docker registry

`/volume1/docker/registry/docker-compose.yml`:

```yaml
services:
  registry:
    image: registry
    container_name: registry
    volumes:
      - /volume1/docker/registry/data:/var/lib/registry
    ports:
      - 5050:5000
    restart: unless-stopped
```

```bash
sudo mkdir -p /volume1/docker/registry/data
cd /volume1/docker/registry
sudo docker-compose up -d
```

### Synology Docker daemon config

Synology uses its own Docker config file (not `/etc/docker/daemon.json`):

`/var/packages/ContainerManager/etc/dockerd.json` — add `insecure-registries`:

```json
{
  "bip": "172.17.0.1/16",
  "data-root": "/var/packages/ContainerManager/var/docker",
  "log-driver": "db",
  "registry-mirrors": [],
  "seccomp-profile": "unconfined",
  "storage-driver": "btrfs",
  "insecure-registries": ["(synology.ip):5050"]
}
```

Restart Container Manager after editing:

```bash
sudo synopkg stop ContainerManager && sleep 3 && sudo synopkg start ContainerManager
```

### Reverse proxy (local network)

Set up in **DSM → Control Panel → Login Portal → Advanced → Reverse Proxy**:

- Source: `http://portfolio.local:80`
- Destination: `http://(synology.ip):3000`

Add to `C:\Windows\System32\drivers\etc\hosts` on Windows:

```
(synology.ip)    portfolio.local
```

---

## Cloudflare Tunnel

The app is exposed via a Cloudflare Tunnel — no open ports on the router required. Works even behind CGNAT.

### Tunnel container on Synology

```bash
sudo docker run -d \
  --name cloudflared \
  --restart unless-stopped \
  cloudflare/cloudflared:latest tunnel --no-autoupdate run \
  --token '<your_tunnel_token>'
```

### DNS

| Record | Type | Target |
|--------|------|--------|
| jknight.uk | CNAME | (Cloudflare tunnel) |
| old.jknight.uk | CNAME | (Old server) |

---

## Dockerfile

Rails 8.1 generates a Dockerfile automatically. One tweak required — bypass Thruster (which tries to bind to port 80 as a non-root user) and run Puma directly:

```dockerfile
# Replace the default CMD with:
CMD ["./bin/rails", "server", "-b", "0.0.0.0", "-p", "3000"]
```

---

## Environment Variables

Stored in `.env` (never committed to git):

```env
RAILS_MASTER_KEY=
DB_HOST=
DB_PORT=5433
PORTFOLIO_DATABASE_PASSWORD=
SYNOLOGY_SSH_PORT=2222
SYNOLOGY_USER=Joe
SYNOLOGY_IP=(synology.ip)
REGISTRY=(synology.ip):5050
```

In `config/database.yml` production section:

```yaml
host: <%= ENV["DB_HOST"] %>
port: <%= ENV["DB_PORT"] || 5433 %>
```

---

## Deploying

### Deploy script

Run `./deploy.sh` from the project root:

```bash
#!/bin/bash
set -a
source "$(dirname "$0")/.env"
set +a

echo "🔨 Building image..."
docker build -t $REGISTRY/portfolio:latest .

echo "📦 Pushing to Synology registry..."
docker push $REGISTRY/portfolio:latest

echo "🚀 Deploying on Synology..."
ssh $SYNOLOGY_USER@$SYNOLOGY_IP -p $SYNOLOGY_SSH_PORT "
  sudo /usr/local/bin/docker pull $REGISTRY/portfolio:latest &&
  sudo /usr/local/bin/docker stop portfolio &&
  sudo /usr/local/bin/docker rm portfolio &&
  sudo /usr/local/bin/docker run -d \
    --name portfolio \
    --restart unless-stopped \
    -p 3000:3000 \
    -e RAILS_ENV=production \
    -e RAILS_MASTER_KEY='$RAILS_MASTER_KEY' \
    -e DB_HOST='$DB_HOST' \
    -e DB_PORT='$DB_PORT' \
    -e PORTFOLIO_DATABASE_PASSWORD='$PORTFOLIO_DATABASE_PASSWORD' \
    $REGISTRY/portfolio:latest
"

echo "✅ Done! Visit https://jknight.uk"
```

---

## TODO

- [ ] Refactor comment form into `comments/_form.html.erb` partial with `comments/new` route
- [ ] Remove `comments/index` — move to `admin/comments/index`
- [ ] Build `admin/` namespace with dashboard
- [ ] Comment approval in admin
- [ ] Comment validations (no empty fields)
- [ ] Finish basic portfolio site
- [ ] Add animations
- [ ] Uptime comparison widget — Synology vs GitHub using [GitHub Status API](https://www.githubstatus.com/api/v2/status.json)

---

## Gotchas & Notes

- **Port 5000** is used by DSM — use 5050 for the registry
- **Port 5432** was taken by native Synology Postgres — use 5433 for the Docker one
- **Synology Docker config** lives at `/var/packages/ContainerManager/etc/dockerd.json`
- **Thruster** (Rails 8 default server) tries to bind to port 80 and fails as non-root — bypass with direct Puma CMD