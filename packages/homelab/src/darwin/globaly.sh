#!/bin/zsh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/utils/unix/utils.sh" ]; then
  source "$SCRIPT_DIR/utils/unix/utils.sh"
  UTILS_DIR="$SCRIPT_DIR/utils/unix"
else
  source "$(cd "$SCRIPT_DIR/.." && pwd)/utils/unix/utils.sh"
  UTILS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/utils/unix"
fi

if [ -f "$UTILS_DIR/unix/validation.sh" ]; then
  source "$UTILS_DIR/unix/validation.sh"
fi

if [ -f "$UTILS_DIR/unix/env.sh" ]; then
  source "$UTILS_DIR/unix/env.sh"
  load_env "$SCRIPT_DIR"
fi

GITCONFIG="$HOME/.gitconfig"

if [ -z "$GIT_USER" ] || [ -z "$GIT_EMAIL" ]; then
  if [ -f "$GITCONFIG" ]; then
    if [ -z "$GIT_USER" ]; then
      GIT_USER=$(git config --file "$GITCONFIG" --get user.name 2>/dev/null)
    fi
    if [ -z "$GIT_EMAIL" ]; then
      GIT_EMAIL=$(git config --file "$GITCONFIG" --get user.email 2>/dev/null)
    fi
  fi
fi

if [ -n "$GIT_USER" ] && [ -n "$GIT_EMAIL" ]; then
  if command -v is_valid_email >/dev/null 2>&1; then
    if ! is_valid_email "$GIT_EMAIL"; then
      warn "Invalid email format: $GIT_EMAIL"
      GIT_EMAIL=""
    fi
  fi
fi

if [ -n "$GIT_USER" ] && [ -n "$GIT_EMAIL" ]; then
  info "Using Git user: $GIT_USER ($GIT_EMAIL)"
else
  warn "Git User or Email not found. Please enter."
  
  echo -n "Please enter your Git username: "
  read GIT_USER
  
  if command -v ask_email >/dev/null 2>&1; then
    GIT_EMAIL=$(ask_email)
  else
    echo -n "Please enter your Git email address: "
    read GIT_EMAIL
    if command -v is_valid_email >/dev/null 2>&1; then
      while ! is_valid_email "$GIT_EMAIL"; do
        warn "Invalid email format. Please try again."
        echo -n "Please enter your Git email address: "
        read GIT_EMAIL
      done
    fi
  fi
  
  if [ -z "$GIT_USER" ] || [ -z "$GIT_EMAIL" ]; then
    err "Git username and email are required. Please set GIT_USER and GIT_EMAIL in .env file."
    exit 1
  fi
  
  info "Using entered Git user: $GIT_USER ($GIT_EMAIL)"
fi

info "Configure Git global..."

git config --global user.name "$GIT_USER"
git config --global user.email "$GIT_EMAIL"
git config --global core.pager "diff-so-fancy | less --tabs=4 -RF"
git config --global interactive.diffFilter "diff-so-fancy --patch"
git config --global color.ui true

git config --global color.diff-highlight.oldNormal     "red bold"
git config --global color.diff-highlight.oldHighlight  "red bold 52"
git config --global color.diff-highlight.newNormal     "green bold"
git config --global color.diff-highlight.newHighlight  "green bold 22"

git config --global color.diff.meta    "11"
git config --global color.diff.frag    "magenta bold"
git config --global color.diff.func    "146 bold"
git config --global color.diff.commit  "yellow bold"
git config --global color.diff.old     "red bold"
git config --global color.diff.new     "green bold"
git config --global color.diff.whitespace "red reverse"

ok "Git global configuration completed."


###############################################################################
# Transfer Cursor SETTINGS
###############################################################################

CURSOR_SETTINGS_DIR="$HOME/Library/Application Support/Cursor/User"
CURSOR_SETTINGS_FILE="$CURSOR_SETTINGS_DIR/settings.json"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
SOURCE_SETTINGS="$REPO_ROOT/.vscode/settings.json"

info "Transferring Cursor Editor Settings..."

mkdir -p "$CURSOR_SETTINGS_DIR"

if [ -f "$SOURCE_SETTINGS" ]; then
  cp "$SOURCE_SETTINGS" "$CURSOR_SETTINGS_FILE"
  ok "Cursor settings.json updated successfully."
else
  warn "Source settings file not found: $SOURCE_SETTINGS"
  warn "Skipping Cursor settings transfer."
fi

###############################################################################
# Transfer Global .npmrc
###############################################################################

GLOBAL_NPMRC="$HOME/.npmrc"
SOURCE_NPMRC="$REPO_ROOT/.npmrc"

info "Setting up global .npmrc..."

if [ -f "$SOURCE_NPMRC" ]; then
  cp "$SOURCE_NPMRC" "$GLOBAL_NPMRC"
  ok "Global .npmrc updated successfully."
else
  warn "Source .npmrc file not found: $SOURCE_NPMRC"
  warn "Skipping global .npmrc setup."
fi
