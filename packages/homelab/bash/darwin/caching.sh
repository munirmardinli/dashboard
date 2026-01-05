#!/bin/zsh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/utils/utils.sh" ]; then
  source "$SCRIPT_DIR/utils/utils.sh"
else
  source "$(cd "$SCRIPT_DIR/.." && pwd)/utils/utils.sh"
fi

###############################################################################
# --- Homebrew Caching & Cleanup ---------------------------------------------
###############################################################################

OS="$(uname -s)"
info "Checking operating system: $OS"

if [ "$OS" = "Darwin" ]; then
  BREW_PATH="/opt/homebrew/bin/brew"
elif [ "$OS" = "Linux" ]; then
  BREW_PATH="/home/linuxbrew/.linuxbrew/bin/brew"
else
  err "Unsupported operating system: $OS"
  exit 1
fi

# Ensure Homebrew is available
if ! command -v brew >/dev/null 2>&1; then
  err "Homebrew is not installed. Please run brew.sh first."
  exit 1
fi

eval "$($BREW_PATH shellenv)"

info "Updating Homebrew package lists..."
run_safe "brew update"

info "Upgrading installed packages..."
run_safe "brew upgrade"

info "Cleaning up old versions and cache..."
run_safe "brew cleanup --prune=all"

info "Removing unused dependencies..."
run_safe "brew autoremove"

ok "Homebrew caching and cleanup completed successfully."
