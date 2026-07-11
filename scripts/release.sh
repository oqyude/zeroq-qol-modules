#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

BUMP="${1:-patch}"

CURRENT_VERSION=$(node -p "require('./manifest.json').version")

if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  NEW_VERSION="$BUMP"
elif [[ "$BUMP" == "patch" ]]; then
  NEW_VERSION=$(node -p "
    const [a,b,c] = '$CURRENT_VERSION'.split('.').map(Number);
    \`\${a}.\${b}.\${c+1}\`
  ")
elif [[ "$BUMP" == "minor" ]]; then
  NEW_VERSION=$(node -p "
    const [a,b] = '$CURRENT_VERSION'.split('.').map(Number);
    \`\${a}.\${b+1}.0\`
  ")
elif [[ "$BUMP" == "major" ]]; then
  NEW_VERSION=$(node -p "
    const [a] = '$CURRENT_VERSION'.split('.').map(Number);
    \`\${a+1}.0.0\`
  ")
else
  echo "Usage: $0 [patch|minor|major|<semver>]"
  exit 1
fi

echo "Current: $CURRENT_VERSION"
echo "New:     $NEW_VERSION"
read -p "Proceed? [y/N] " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Aborted."; exit 1
fi

node -e "
  const fs = require('fs');
  const m = require('./manifest.json'); m.version = '$NEW_VERSION';
  fs.writeFileSync('./manifest.json', JSON.stringify(m, null, '\t') + '\n');
  const p = require('./package.json'); p.version = '$NEW_VERSION';
  fs.writeFileSync('./package.json', JSON.stringify(p, null, '\t') + '\n');
"

npm run build

git add -f manifest.json package.json main.js styles.css
git commit -m "v$NEW_VERSION"
git tag "v$NEW_VERSION"

echo ""
echo "✔ Release v$NEW_VERSION ready."
echo "Run: git push && git push --tags"
