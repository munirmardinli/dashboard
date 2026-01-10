#!/bin/zsh

set -e
set -u
set -o pipefail

export PATH="/var/packages/ContainerManager/target/usr/bin:/var/packages/ContainerManager/target/tool:/usr/local/bin:$PATH"

ROOT_DOCKER="/volume1/docker"

echo "=== Synology CLI Task ==="
echo "Hostname: $(hostname)"
echo "Aktuelle Zeit: $(date)"

cd $ROOT_DOCKER

docker image prune -f || true
docker volume prune -f || true
