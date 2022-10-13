set -e

if [ ! -f ./.env ]; then
    echo "Oops! Looks like you haven't pre-installed it yet!"
    sh ./scripts/preinstall.sh
    exit 0
fi

npm run lint
rollup -c rollup.config.js
rollup -c rollup.plugin.config.js
exit 0