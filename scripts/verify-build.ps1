Write-Host "Starting Build Verification..." -ForegroundColor Cyan

# 1. Lint
# Skipping manual lint step due to CLI directory issue. Next build will handle linting.
# Write-Host "Running Lint..." -ForegroundColor Yellow
# npm run lint
# if ($LASTEXITCODE -ne 0) {
#    Write-Error "Linting failed!"
#    exit 1
# }

# 2. Type Check (tsc)
# Note: Next.js build already runs type checks, but running tsc separately can be faster for quick checks
# if you want to skip emit.
Write-Host "Running Type Check..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Error "Type Checking failed!"
    exit 1
}

# 3. Build using Next.js
Write-Host "Running Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    exit 1
}

Write-Host "Verification Success! Your app is ready to deploy." -ForegroundColor Green
exit 0
