[[ -d "dist" ]] && rm -rf dist/*
rm -rf build/*.tar.gz
npm i
npm run build
