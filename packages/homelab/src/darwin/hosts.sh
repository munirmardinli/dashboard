#!/bin/zsh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/utils/unix/utils.sh" ]; then
  source "$SCRIPT_DIR/utils/unix/utils.sh"
else
  source "$(cd "$SCRIPT_DIR/.." && pwd)/utils/unix/utils.sh"
fi

if [ -f "$SCRIPT_DIR/utils/unix/env.sh" ]; then
  source "$SCRIPT_DIR/utils/unix/env.sh"
else
  source "$(cd "$SCRIPT_DIR/.." && pwd)/utils/unix/env.sh"
fi

load_env "$SCRIPT_DIR"

HOSTS_FILE="/etc/hosts"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
HOSTS_JSON="$REPO_ROOT/hosts.json"

if [ -z "$DARWIN_PASSWORD" ]; then
  info "DARWIN_PASSWORD not found in .env, prompting interactively..."
  read -s "?Enter sudo password: " DARWIN_PASSWORD
  echo
  if [ -z "$DARWIN_PASSWORD" ]; then
    err "Password is required"
    exit 1
  fi
fi

if ! command -v jq &> /dev/null; then
  err "jq is required but not installed. Please install it with: brew install jq"
  exit 1
fi

if [ ! -f "$HOSTS_JSON" ]; then
  err "hosts.json not found at $HOSTS_JSON"
  exit 1
fi

info "Reading hosts from $HOSTS_JSON..."

ENTRY_COUNT=$(jq '. | length' "$HOSTS_JSON" 2>/dev/null)
if [ -z "$ENTRY_COUNT" ] || [ "$ENTRY_COUNT" -eq 0 ]; then
  warn "No entries found in hosts.json"
  exit 0
fi

info "Found $ENTRY_COUNT host entry/entries to process"

for i in $(seq 0 $((ENTRY_COUNT - 1))); do
  IP=$(jq -r ".[$i].ip" "$HOSTS_JSON" 2>/dev/null)
  HOSTNAME=$(jq -r ".[$i].hostname" "$HOSTS_JSON" 2>/dev/null)
  
  if [ -z "$IP" ] || [ -z "$HOSTNAME" ] || [ "$IP" = "null" ] || [ "$HOSTNAME" = "null" ]; then
    warn "Skipping invalid entry at index $i"
    continue
  fi
  
  ENTRY="$IP $HOSTNAME"
  info "Processing: $ENTRY"
  
  if grep -E -q "^[[:space:]]*${IP}[[:space:]]+${HOSTNAME}([[:space:]]|$)" "$HOSTS_FILE" 2>/dev/null; then
    ok "Entry already correct: $ENTRY"
  else
    if grep -E -q "[[:space:]]+${HOSTNAME}([[:space:]]|$)" "$HOSTS_FILE" 2>/dev/null; then
      warn "Entry for $HOSTNAME already exists but with different IP. Current entry:"
      grep -E "[[:space:]]+${HOSTNAME}([[:space:]]|$)" "$HOSTS_FILE" | sed 's/^/  /'
      info "Skipping update. Please update manually if needed."
    else
      info "Adding $ENTRY to $HOSTS_FILE..."
      if echo "$DARWIN_PASSWORD" | sudo -S sh -c "echo '$ENTRY' >> $HOSTS_FILE" 2>/dev/null; then
        ok "Successfully added $ENTRY to $HOSTS_FILE"
      else
        err "Failed to add entry to $HOSTS_FILE"
        exit 1
      fi
    fi
  fi
done

ok "Hosts configuration completed"
