#!/bin/bash
# =============================================================
# Video Worker — Setup da VPS (KVM1: 1 vCPU, 4 GB RAM, 50 GB NVMe)
# Rodar como root: bash worker/scripts/setup.sh
#
# REGRAS:
# - Tudo sequencial, nunca paralelo
# - Respeitar limite de 4 GB RAM
# - Swap obrigatório como segurança
# - Redis com maxmemory 256mb
# - Remotion com concurrency=1
# - Cleanup automático após publicação
# =============================================================

set -e

echo "========================================"
echo " Video Worker — Setup VPS (KVM1)"
echo " 1 vCPU | 4 GB RAM | 50 GB NVMe"
echo "========================================"
echo ""

# ----------------------------------------------------------
# 0. Swap (2 GB) — segurança contra OOM
# ----------------------------------------------------------
echo "[0/8] Criando swap de 2 GB..."
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl vm.swappiness=10
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
  echo "  Swap ativo: 2 GB"
else
  echo "  Swap já existe, pulando"
fi

# ----------------------------------------------------------
# 1. Atualizar sistema
# ----------------------------------------------------------
echo "[1/8] Atualizando sistema..."
apt-get update -qq
apt-get upgrade -y -qq

# ----------------------------------------------------------
# 2. Node.js 22 LTS
# ----------------------------------------------------------
echo "[2/8] Instalando Node.js 22..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi
echo "  Node: $(node -v)"
echo "  npm: $(npm -v)"

# ----------------------------------------------------------
# 3. ffmpeg
# ----------------------------------------------------------
echo "[3/8] Instalando ffmpeg..."
apt-get install -y -qq ffmpeg
echo "  ffmpeg: $(ffmpeg -version 2>&1 | head -1)"

# ----------------------------------------------------------
# 4. yt-dlp
# ----------------------------------------------------------
echo "[4/8] Instalando yt-dlp..."
curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
chmod a+rx /usr/local/bin/yt-dlp
echo "  yt-dlp: $(yt-dlp --version)"

# ----------------------------------------------------------
# 5. Redis (com limite de memória)
# ----------------------------------------------------------
echo "[5/8] Instalando Redis..."
apt-get install -y -qq redis-server

if ! grep -q "maxmemory 256mb" /etc/redis/redis.conf; then
  echo "maxmemory 256mb" >> /etc/redis/redis.conf
  echo "maxmemory-policy allkeys-lru" >> /etc/redis/redis.conf
fi

systemctl enable redis-server
systemctl restart redis-server

# ----------------------------------------------------------
# 6. Chromium (pra Remotion headless)
# ----------------------------------------------------------
echo "[6/8] Instalando Chromium + dependências..."
apt-get install -y -qq \
  chromium-browser 2>/dev/null || apt-get install -y -qq chromium 2>/dev/null || true

apt-get install -y -qq \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
  libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
  libxrandr2 libgbm1 libpango-1.0-0 libcairo2 \
  libasound2 libxshmfence1 2>/dev/null || true

# ----------------------------------------------------------
# 7. PM2
# ----------------------------------------------------------
echo "[7/8] Instalando PM2..."
npm install -g pm2 --quiet
echo "  PM2: $(pm2 -v)"

# ----------------------------------------------------------
# 8. Diretórios e permissões
# ----------------------------------------------------------
echo "[8/8] Criando diretórios..."
mkdir -p /data/video-worker/jobs
mkdir -p /root/emailhacker-viral/worker/logs

# ----------------------------------------------------------
# Resumo
# ----------------------------------------------------------
echo ""
echo "========================================"
echo " Setup completo!"
echo "========================================"
echo ""
echo " Memória:"
echo "   RAM: $(free -h | awk '/Mem:/ {print $2}')"
echo "   Swap: $(free -h | awk '/Swap:/ {print $2}')"
echo "   Redis: 256 MB (limite)"
echo ""
echo " Próximo:"
echo "   cd /root/emailhacker-viral/worker"
echo "   npm install"
echo "   pm2 start ecosystem.config.cjs"
echo ""
