#!/usr/bin/env bash
set -e

# =============================================================================
# Script de deploy - Fique Ryco (Raffle)
# Uso: ./deploy.sh [opções]
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Deploy remoto (ajuste se necessário)
REMOTE_USER="root"
REMOTE_HOST="46.224.205.134"
REMOTE_DIR="/root/raffle"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# -----------------------------------------------------------------------------
# Verificações
# -----------------------------------------------------------------------------
check_docker() {
  if ! command -v docker &> /dev/null; then
    log_error "Docker não encontrado. Instale o Docker e tente novamente."
    exit 1
  fi
  if ! docker info &> /dev/null; then
    log_error "Docker não está rodando ou você não tem permissão."
    exit 1
  fi
}

check_compose() {
  if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
  elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
  else
    log_error "Docker Compose não encontrado. Instale e tente novamente."
    exit 1
  fi
  log_info "Usando: $COMPOSE_CMD"
}

# -----------------------------------------------------------------------------
# .env para produção (opcional)
# -----------------------------------------------------------------------------
ensure_env() {
  if [ ! -f .env ]; then
    if [ -f .env.example ]; then
      log_warn ".env não encontrado. Copiando de .env.example"
      cp .env.example .env
      log_warn "Edite o arquivo .env com os valores corretos antes de usar em produção!"
    else
      log_warn ".env não encontrado. O docker-compose usará variáveis do próprio arquivo."
    fi
  fi
}

# -----------------------------------------------------------------------------
# Comandos
# -----------------------------------------------------------------------------
cmd_build() {
  log_info "Construindo imagens..."
  $COMPOSE_CMD build --no-cache
}

cmd_up() {
  log_info "Subindo serviços (postgres + app)..."
  $COMPOSE_CMD up -d
  log_info "Aplicação disponível em http://localhost:3000"
  log_info "PostgreSQL em localhost:5432"
}

cmd_down() {
  log_info "Parando e removendo containers..."
  $COMPOSE_CMD down
}

cmd_restart() {
  cmd_down
  cmd_up
}

cmd_logs() {
  $COMPOSE_CMD logs -f "${@:-}"
}

cmd_ps() {
  $COMPOSE_CMD ps
}

# -----------------------------------------------------------------------------
# Cópia para servidor remoto (sem node_modules)
# -----------------------------------------------------------------------------
cmd_sync() {
  if ! command -v rsync &> /dev/null; then
    log_error "rsync não encontrado. Instale rsync (ex: brew install rsync) e tente novamente."
    exit 1
  fi
  log_info "Copiando arquivos para ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR} (excluindo node_modules, .git, dist)..."
  rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '/uploads' \
    --exclude '.env' \
    --exclude '*.log' \
    . "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"
  log_info "Cópia concluída."
}

# -----------------------------------------------------------------------------
# Deploy no servidor (roda no CentOS: build + up)
# -----------------------------------------------------------------------------
cmd_server_deploy() {
  check_docker
  check_compose
  ensure_env
  log_info "Deploy no servidor: build + up"
  $COMPOSE_CMD build --no-cache
  $COMPOSE_CMD up -d
  log_info "Deploy concluído. App: http://localhost:3000"
  $COMPOSE_CMD ps
}

# -----------------------------------------------------------------------------
# Deploy remoto: sync da sua máquina + executa deploy no servidor (CentOS)
# -----------------------------------------------------------------------------
cmd_deploy_remote() {
  if ! command -v rsync &> /dev/null; then
    log_error "rsync não encontrado. Instale rsync (ex: brew install rsync)."
    exit 1
  fi
  if ! command -v ssh &> /dev/null; then
    log_error "ssh não encontrado."
    exit 1
  fi
  log_info "1/2 Copiando arquivos para ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR} ..."
  rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '*.log' \
    . "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"
  log_info "2/2 Executando deploy no servidor (Docker Compose)..."
  ssh "${REMOTE_USER}@${REMOTE_HOST}" "cd ${REMOTE_DIR} && chmod +x deploy.sh && ./deploy.sh server-deploy"
  log_info "Deploy remoto concluído. App: http://${REMOTE_HOST}:3000"
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
usage() {
  echo "Uso: $0 [comando]"
  echo ""
  echo "Na sua máquina (local):"
  echo "  deploy         Sync para o servidor + roda Docker Compose no servidor (recomendado)"
  echo "  sync           Só copia arquivos para o servidor (sem node_modules)"
  echo ""
  echo "No servidor (ex: CentOS, após sync):"
  echo "  server-deploy  Build + sobe os containers (postgres + app)"
  echo "  up             Sobe os serviços"
  echo "  down           Para e remove os containers"
  echo "  build          Reconstrói as imagens"
  echo "  restart        down + up"
  echo "  logs [svc]     Logs (ex: logs app)"
  echo "  ps             Lista containers"
  echo ""
  echo "Remoto: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"
  echo ""
  echo "Exemplos:"
  echo "  $0                  # deploy completo: sync + docker no servidor"
  echo "  $0 sync             # só copia arquivos"
  echo "  $0 server-deploy    # no servidor: build e sobe (após sync)"
}

case "${1:-deploy}" in
  up)             check_docker; check_compose; ensure_env; cmd_up ;;
  down)           check_docker; check_compose; cmd_down ;;
  build)          check_docker; check_compose; cmd_build ;;
  restart)        check_docker; check_compose; cmd_restart ;;
  logs)           check_docker; check_compose; shift; cmd_logs "$@" ;;
  ps)             check_docker; check_compose; cmd_ps ;;
  sync)           cmd_sync ;;
  server-deploy)  cmd_server_deploy ;;
  deploy)         cmd_deploy_remote ;;
  -h|--help)      usage ;;
  *)              log_error "Comando desconhecido: $1"; usage; exit 1 ;;
esac
