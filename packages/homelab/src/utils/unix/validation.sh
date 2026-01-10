#!/bin/zsh

# --- Email validation --------------------------------------------------------

is_valid_email() {
  local email="$1"

  # Very good regex for standard emails
  if [[ "$email" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
    return 0
  else
    return 1
  fi
}

ask_email() {
  while true; do
    read "email?Please enter your Git email address: "
    if is_valid_email "$email"; then
      ok "Email accepted: $email"
      log_write "VALID_EMAIL: $email"
      echo "$email"
      return 0
    else
      warn "Invalid email. Example: user@example.com"
    fi
  done
}
