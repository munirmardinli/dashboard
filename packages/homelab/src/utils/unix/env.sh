#!/bin/zsh

# --- Load .env file -----------------------------------------------------------

load_env() {
  local script_dir="$1"
  local homelab_env=""
  local root_env=""
  
  local current_dir="$script_dir"
  while [ "$current_dir" != "/" ]; do
    if [ -f "$current_dir/package.json" ]; then
      root_env="$current_dir/.env"
      break
    fi
    current_dir="$(dirname "$current_dir")"
  done
  
  current_dir="$script_dir"
  while [ "$current_dir" != "/" ]; do
    if [ "$(basename "$current_dir")" = "homelab" ]; then
      parent_dir="$(dirname "$current_dir")"
      if [ "$(basename "$parent_dir")" = "packages" ]; then
        homelab_env="$current_dir/.env"
        break
      fi
    fi
    current_dir="$(dirname "$current_dir")"
  done
  
  local env_loaded=0
  
  if [ -n "$homelab_env" ] && [ -f "$homelab_env" ]; then
    info "Loading configuration from $homelab_env ..."
    while IFS= read -r line || [ -n "$line" ]; do
      [[ "$line" =~ ^[[:space:]]*# ]] && continue
      [[ -z "${line// }" ]] && continue
      export "$line" 2>/dev/null || true
    done < "$homelab_env"
    env_loaded=1
  fi
  
  if [ -n "$root_env" ] && [ -f "$root_env" ]; then
    info "Loading configuration from $root_env ..."
    while IFS= read -r line || [ -n "$line" ]; do
      [[ "$line" =~ ^[[:space:]]*# ]] && continue
      [[ -z "${line// }" ]] && continue
      export "$line" 2>/dev/null || true
    done < "$root_env"
    env_loaded=1
  fi
  
  if [ $env_loaded -eq 0 ]; then
    if [ -n "$homelab_env" ] && [ ! -f "$homelab_env" ]; then
    fi
    if [ -n "$root_env" ] && [ "$root_env" != "$homelab_env" ] && [ ! -f "$root_env" ]; then
    fi
  fi
}
