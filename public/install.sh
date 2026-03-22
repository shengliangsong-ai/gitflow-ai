#!/bin/bash
set -e

echo "🚀 Installing AI GitFlow CLI..."

# Use the URL passed as the first argument, or fallback to the default
BASE_URL="${1:-https://gitflow-ai-836641670384.us-west1.run.app}"

INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"

echo "⬇️ Downloading git-ai from $BASE_URL..."
curl -sL "$BASE_URL/git-ai.js" -o "$INSTALL_DIR/git-ai"

# Make it executable
chmod +x "$INSTALL_DIR/git-ai"

# Install SQLite dependency globally for local context history
if command -v npm &> /dev/null; then
    echo "📦 Installing SQLite dependency for local AI context history..."
    npm install -g better-sqlite3 --silent || echo "⚠️  Could not install better-sqlite3 globally. CLI will fallback to JSON context storage."
else
    echo "⚠️  npm not found. CLI will fallback to JSON context storage instead of SQLite."
fi

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
