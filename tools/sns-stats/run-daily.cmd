@echo off
rem Daily Artour SNS stats: collect through the signed-in Aside browser, then commit and push the JSON.
cd /d "%~dp0..\.."
if not exist tools\sns-stats\logs mkdir tools\sns-stats\logs
"C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" tools\sns-stats\collect.cjs --push >> tools\sns-stats\logs\collect.log 2>&1
