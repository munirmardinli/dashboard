#!/bin/zsh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/utils/unix/utils.sh" ]; then
  source "$SCRIPT_DIR/utils/unix/utils.sh"
else
  source "$(cd "$SCRIPT_DIR/.." && pwd)/utils/unix/utils.sh"
fi

###############################################################################
# --- Check operating system & install Homebrew ------------------------------
###############################################################################

OS="$(uname -s)"
info "Checking operating system: $OS"

if [ "$OS" = "Darwin" ]; then
  BREW_PATH="/opt/homebrew/bin/brew"
  PROFILE="$HOME/.zprofile"

elif [ "$OS" = "Linux" ]; then
  BREW_PATH="/home/linuxbrew/.linuxbrew/bin/brew"
  PROFILE="$HOME/.profile"

else
  err "Unsupported operating system: $OS"
  exit 1
fi

# Homebrew Installation
if ! command -v brew >/dev/null 2>&1; then
  info "Homebrew not found. Installing..."
  export HOMEBREW_NO_INSTALL_FROM_API=1
  run_safe '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'

  echo "" >> $PROFILE
  echo "eval \"\$($BREW_PATH shellenv)\"" >> $PROFILE
  eval "$($BREW_PATH shellenv)"

  ok "Homebrew installed successfully."
else
  ok "Homebrew is already installed."
  eval "$($BREW_PATH shellenv)"
fi

###############################################################################
# --- Homebrew Update & Install Packages + Casks -----------------------------
###############################################################################

packages=(
  wget
  node
  git
  sshpass
  powerlevel10k
  zsh-syntax-highlighting
  zsh-autosuggestions
  zsh-completions
  bat
  eza
  zsh
  fzf
  fontconfig
  diff-so-fancy
  zoxide
)

casks=(
  font-fira-code-nerd-font
  font-jetbrains-mono-nerd-font
  font-meslo-lg-nerd-font
  cursor
  antigravity
  parallels
)

install_items() {
  local type=$1
  shift
  for item in "$@"; do
    if brew list $type "$item" >/dev/null 2>&1; then
      ok "$item is already installed."
    else
      info "Installing $item..."
      run_safe "brew install $type $item"
    fi
  done
}

info "Installing Brew Packages..."
install_items "" $packages

info "Installing Brew Casks..."
install_items "--cask" $casks

ok "Brew list completed."
