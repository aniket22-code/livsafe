Write-Host "Medical Assistant Deployment Helper" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "Checking prerequisites..." -ForegroundColor Yellow

if (Get-Command "node" -ErrorAction SilentlyContinue) {
    Write-Host "Node.js found" -ForegroundColor Green
} else {
    Write-Host "Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

if (Get-Command "npm" -ErrorAction SilentlyContinue) {
    Write-Host "npm found" -ForegroundColor Green
} else {
    Write-Host "npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "Building backend..." -ForegroundColor Cyan
Set-Location "server"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ".."

Write-Host "Building frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Project built successfully!" -ForegroundColor Green

Write-Host "Deployment Instructions:" -ForegroundColor Yellow
Write-Host "1. Database: Setup MongoDB Atlas"
Write-Host "2. Backend: Deploy to Railway"
Write-Host "3. Frontend: Deploy to Vercel"
Write-Host "4. Check DEPLOYMENT.md for detailed instructions"

Write-Host "Project is ready for deployment!" -ForegroundColor Green
