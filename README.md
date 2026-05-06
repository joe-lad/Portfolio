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
- **Action Text** (rich text for project descriptions)
- **Active Storage** (project cover photos)
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

### Dark mode toggle

`app/javascript/theme.js` — reads/writes `localStorage` and sets `data-theme` on the `<html>` element. Respects `prefers-color-scheme` by default, overridden by manual toggle.

### Scroll spy

`app/javascript/scrollspy.js` — uses `IntersectionObserver` to add `.active` class to sidebar nav links as sections scroll into view. Uses `rootMargin: '-20% 0px -60% 0px'` to create an active zone in the upper portion of the viewport, ensuring only one link is ever active at a time. Picks the topmost visible section when multiple are in view.

### Sidebar (mobile)

`app/views/shared/_sidebar.html.erb` — on mobile (≤640px) the sidebar is hidden off-screen and toggled via a hamburger button. The burger animates into an × when open. Tapping a nav link or the overlay closes it.

`app/javascript/sidebar.js` — uses explicit `open()` / `close()` / `toggle()` functions with event delegation on `document` to survive Turbo navigations. Uses `turbo:load` instead of `DOMContentLoaded` so listeners are re-attached after each Turbo page load.

### VS Code Extensions

- Ruby LSP (Shopify)
- ERB Helper Tags
- Bootstrap 5 & Font Awesome Snippets

> **Important:** Open the project via `code .` from WSL terminal to ensure VS Code runs in WSL mode (check bottom left shows `WSL: Ubuntu`).

---

## Theming

CSS custom properties are defined in `application.bootstrap.scss` before the Bootstrap import so Bootstrap picks them up at compile time. Component-level styles and dark mode overrides live in `app/assets/stylesheets/Theme.css`.

### Colour palette

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--color-brand` | `#1e3a5f` | `#1e3a5f` | Navbar, primary buttons |
| `--color-brand-hover` | `#2d5a8e` | `#2d5a8e` | Hover states |
| `--color-accent` | `#4a9eff` | `#4a9eff` | Links, active states, section titles |
| `--color-bg` | `#f8f9fb` | `#111213` | Page background |
| `--color-bg-surface` | `#ffffff` | `#0f1923` | Cards, sidebar |
| `--color-fg` | `#1e293b` | `#e2e8f0` | Body text |
| `--color-fg-muted` | `#64748b` | `#94a3b8` | Secondary text |
| `--color-border` | `#e2e8f0` | `#2d3748` | Borders, dividers |

### Dark mode

Dark mode follows system preference by default (`prefers-color-scheme`). Users can override with the toggle button in the sidebar, which saves their preference to `localStorage`. Priority order:

**localStorage → system preference → light mode default**

---

## Layout

The app uses a two-column sticky sidebar layout:

- `app/views/shared/_sidebar.html.erb` — sidebar partial with nav links, social links, and theme toggle
- `app/views/layouts/application.html.erb` — renders the sidebar alongside `<main>`
- `app/views/layouts/admin.html.erb` — separate admin layout with its own sidebar

---

## Models

### Comment

| Column | Type | Notes |
|--------|------|-------|
| name | string | |
| email | string | |
| body | text | |
| approved | boolean | defaults to false |
| timestamps | datetime | |

### Project

| Column | Type | Notes |
|--------|------|-------|
| title | string | |
| featured | boolean | |
| description | Action Text | rich text |
| cover_photo | Active Storage | image attachment |
| timestamps | datetime | |

---

## Routes

```ruby
root "pages#home"

resources :comments, only: [ :create, :show ]
resources :projects, only: [ :show ]

get "/uptime_stats", to: "uptime#stats"

namespace :admin do
  root "dashboard#index"
  resources :comments, only: [ :index, :update, :destroy ]
  resources :projects
end
```

---

## Admin

The admin section lives at `/admin` and uses a separate layout and base controller (`Admin::BaseController`)
Authenticated with basic HTTP authentication

- **Dashboard** — stats for pending comments, total comments, total projects
- **Comments** — list all comments, approve or delete
- **Projects** — full CRUD with rich text description and cover photo upload

---

## Synology NAS Setup

### Requirements

- Synology DSM with **Container Manager** installed
- **Web Station** installed
- SSH enabled: Control Panel → Terminal & SNMP → Terminal

### Docker containers on the NAS

| Container | Image |
|-----------|-------|
| postgres | postgres:16 |
| registry | registry |
| cloudflared | cloudflare/cloudflared |
| portfolio | (synology.ip)/portfolio |

### PostgreSQL container

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
  "data-root": "/var/packages/ContainerManager/var/docker",
  "log-driver": "db",
  "registry-mirrors": [],
  "seccomp-profile": "unconfined",
  "storage-driver": "btrfs",
  "insecure-registries": ["(synology.ip)"]
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
| jknight.uk | CNAME | Cloudflare tunnel (Synology) |
| old.jknight.uk | CNAME | Old server tunnel (locally configured cloudflared) |

> **Note:** `old.jknight.uk` is handled by a locally configured cloudflared instance on the old server (`/etc/cloudflared/config.yml`). Requires a `ServerAlias old.jknight.uk` entry in the Apache virtual host config on that server.

---

## Dockerfile

Rails 8.1 generates a Dockerfile automatically. One tweak required — bypass Thruster (which tries to bind to port 80 as a non-root user) and run Puma directly:

```dockerfile
CMD ["./bin/rails", "server", "-b", "0.0.0.0", "-p", "3000"]
```

---

## Environment Variables

> [!IMPORTANT]
> DEPLOY SCRIPT MUST BE UPDATED WITH ENV VARS!!!

Stored in `.env` (never committed to git):

```env
RAILS_MASTER_KEY=
DB_HOST=
DB_PORT=5433
PORTFOLIO_DATABASE_PASSWORD=
SYNOLOGY_SSH_PORT=2222
SYNOLOGY_USER=Joe
SYNOLOGY_IP=(synology.ip)
REGISTRY=(synology.ip)
```

In `config/database.yml` production section:

```yaml
host: <%= ENV["DB_HOST"] %>
port: <%= ENV["DB_PORT"] %>
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

> **Note:** DSM will send an email alert when the portfolio container stops during deploy. This is a false alarm — the container is intentionally stopped and immediately restarted. Safe to ignore.

---

## Tests

Run the full test suite:

```bash
rails test
```

Run a specific folder:

```bash
rails test test/controllers/admin/
```

### What's covered

- **Admin auth** — all admin controllers verify that unauthenticated requests return 401, valid credentials return 200, and wrong credentials return 401
- **Admin projects** — full CRUD coverage including create with invalid params, update, and destroy
- **Comment validations** — presence and email format

---

## TODO

- [x] Comment form refactor into `comments/_form.html.erb` partial with `comments/new` route
- [x] Website responsiveness — mobile sidebar with hamburger menu, scroll spy, hover state fixes
- [x] Comment validations (no empty fields)
- [x] Admin authentication (replace `require_admin!` placeholder — consider Devise or HTTP basic auth)
- [x] Approve comments before display
- [x] Project show page
- [x] Uptime comparison widget — Synology vs GitHub using [GitHub Status Page](https://mrshu.github.io/github-statuses/)
- [x] Mailer system when a user comments
- [x] Animations
- [ ] Seo
- [ ] First click sometimes doesn't register the theme toggele

---

## Gotchas & Notes

- **Synology Docker config** lives at `/var/packages/ContainerManager/etc/dockerd.json` not `/etc/docker/daemon.json`
- **Thruster** (Rails 8 default server) tries to bind to port 80 and fails as non-root — bypass with direct Puma CMD
- **DSM updates** can reset `/etc/ssh/sshd_config` — re-verify SSH PATH after major updates
- **Bootstrap SCSS variables** must be set before `@import 'bootstrap/scss/bootstrap'` to take effect
- **Propshaft** does not serve from `app/assets/files` — put static downloads like CVs in `public/`
- **Turbo** intercepts link clicks and does not re-fire `DOMContentLoaded` — use `turbo:load` for all JS initialisation instead
- **Mobile hover states** — wrap `:hover` styles in `@media (hover: hover)` to prevent sticky tap highlights on touch devices
- **Comment form** uses `data: { turbo: false }` to bypass Turbo — required for anchor redirects to work on validation failure
- **dotenv-rails** is required to load `.env` variables — without it `ENV["ADMIN_USERNAME"]` returns nil and basic auth crashes on boot
- **Mailtrap** (SMTP email dispatcher) 