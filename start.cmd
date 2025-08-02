
set HTTP_PROXY=http://127.0.0.1:8800
set HTTPS_PROXY=http://127.0.0.1:8800

curl -vvk google.com

echo %HTTP_PROXY%
echo %HTTPS_PROXY%

echo  'npx https://github.com/google-gemini/gemini-cli'

echo  ‘npm install -g @google/gemini-cli’

gemini

pause




