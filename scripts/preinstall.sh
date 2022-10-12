set -e

if [ -f ./.env ]; then
    echo "You already pre-installed!"
    exit 0
fi

read -p "Enter output path (Default: ./build): " outputPath
if [ -z ${outputPath} ]; then
    outputPath='./build'
fi
read -p "Enter output file name (Default: bundle): " outputName
if [ -z ${outputName} ]; then
    outputName='bundle'
fi
read -p "Enter input file name such as your project name (Default: temp): " mainFile
if [ -z ${mainFile} ]; then
    mainFile='temp'
fi
echo "Do you want to use scss compiler?"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) useScss=true break;;
        No ) useScss=false break;;
    esac
done

cat<<EOF >.env
OUTPUT_PATH=$outputPath
OUTPUT_FILE_NAME=$outputName
MAIN_FILE=$mainFile
USE_SCSS=$useScss
EOF

mkdir -p ./src && chmod 777 ./src

if [ ${useScss} == true ]
then
    mkdir -p ./src/ts && chmod 777 ./src/ts
    mkdir -p ./src/scss && chmod 777 ./src/scss
cat<<EOF >./src/ts/${mainFile}.ts
import '../scss/${mainFile}.scss';
EOF
    touch ./src/scss/${mainFile}.scss && chmod 777 ./src/scss/${mainFile}.scss
else
    touch ./src/${mainFile}.ts && chmod 777 ./src/${mainFile}.ts
fi

echo "Check if eslint is installed..."
npm list -g | grep eslint || npm install -g eslint --ignore-scripts
echo "Check if npm-check-updates is installed..."
npm list -g | grep npm-check-updates || npm install -g npm-check-updates --ignore-scripts

echo "Start to install packages"
npm install --ignore-scripts

echo "Finished!"
exit 0