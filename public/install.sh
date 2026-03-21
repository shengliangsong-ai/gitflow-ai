#!/bin/bash
set -e

echo "🚀 Installing AI GitFlow CLI..."

# Use the URL passed to curl, or fallback to the shared URL
BASE_URL="https://gitflow-ai-836641670384.us-west1.run.app"

INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"

echo "⬇️ Downloading git-ai..."
curl -sL "$BASE_URL/git-ai.js" -o "$INSTALL_DIR/git-ai"

# Make it executable
chmod +x "$INSTALL_DIR/git-ai"

# Check if it's in PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> "$HOME/.bashrc"
    if [ -f "$HOME/.zshrc" ]; then
        echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> "$HOME/.zshrc"
    fi
    echo "⚠️  Please restart your terminal or run: source ~/.bashrc (or ~/.zshrc)"
fi

echo "✅ Installed 'git-ai' successfully!"
echo "Try running: git-ai help"
