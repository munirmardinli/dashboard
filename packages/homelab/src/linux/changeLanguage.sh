#!/bin/bash

set -e  # Skript bei Fehler abbrechen

echo "=============================================="
echo " Kali Linux auf Deutsch + Magic Keyboard (ISO)"
echo "=============================================="
echo
echo "Dieses Skript:"
echo " - aktualisiert dein System"
echo " - installiert deutsche Locales"
echo " - setzt System-Sprache auf Deutsch"
echo " - konfiguriert Apple Magic Keyboard (ISO)"
echo " - wendet X11 Layout-Fix an"
echo

# ---------------------------------------------
# 0. System aktualisieren
# ---------------------------------------------
echo "[0/6] System aktualisieren..."
apt-get update
apt-get upgrade -y
apt-get autoremove -y

# ---------------------------------------------
# 1. locales-all installieren
# ---------------------------------------------
echo "[1/6] locales-all installieren..."
apt-get install -y locales-all

# ---------------------------------------------
# 2. Locale setzen
# ---------------------------------------------
echo "[2/6] Locale auf de_DE.UTF-8 setzen..."
echo "de_DE.UTF-8 UTF-8" > /etc/locale.gen
locale-gen de_DE.UTF-8
update-locale LANG=de_DE.UTF-8
export LANG=de_DE.UTF-8
echo "Systemsprache gesetzt auf Deutsch."

# ---------------------------------------------
# 3. Magic Keyboard konfigurieren
# ---------------------------------------------
echo "[3/6] Magic Keyboard konfigurieren..."
cat << EOF > /etc/default/keyboard
XKBMODEL="apple"
XKBLAYOUT="de"
XKBVARIANT="nodeadkeys"
XKBOPTIONS=""
EOF

# Keyboard-Setup neu laden
dpkg-reconfigure -f noninteractive keyboard-configuration
service keyboard-setup restart

# ---------------------------------------------
# 4. X11 Layout-Fix
# ---------------------------------------------
echo "[4/6] X11 Layout-Fix anwenden..."
mkdir -p /etc/X11/xorg.conf.d/
cat << EOF > /etc/X11/xorg.conf.d/00-keyboard.conf
Section "InputClass"
    Identifier "system-keyboard"
    MatchIsKeyboard "on"
    Option "XkbModel" "apple"
    Option "XkbLayout" "de"
    Option "XkbVariant" "nodeadkeys"
EndSection
EOF

# ---------------------------------------------
# 5. Bereinigung
# ---------------------------------------------
echo "[5/6] Nicht mehr benötigte Pakete entfernen..."
apt-get autoremove -y

# ---------------------------------------------
# Abschluss
# ---------------------------------------------
echo "[6/6] Fertig ✅"
echo "Sprache: Deutsch (de_DE.UTF-8)"
echo "Tastatur: Apple Magic Keyboard (ISO)"
echo "Empfohlen: Neustart"

reboot
