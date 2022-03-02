[[ -d "dist" ]] && rm -rf dist/*
rm -rf build/*.tar.gz
echo "VUE_APP_API_URL set to '/${API_BASE_URI}'"
sed -ie "s/VUE_APP_API_URL=\//VUE_APP_API_URL=\/${API_BASE_URI}/" .env
sudo npm i
npm run build
