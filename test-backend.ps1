param(
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl
)

Write-Host "Testing deployed backend at: $BackendUrl" -ForegroundColor Green

# Test health endpoint
Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BackendUrl/health" -Method GET
    Write-Host "✅ Health check passed" -ForegroundColor Green
    Write-Host "Response: $($healthResponse | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test main API endpoint
Write-Host "`nTesting main API endpoint..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-RestMethod -Uri "$BackendUrl/" -Method GET
    Write-Host "✅ Main API endpoint works" -ForegroundColor Green
    Write-Host "Available endpoints:" -ForegroundColor Cyan
    $apiResponse.endpoints | ForEach-Object { Write-Host "  - $($_.PSObject.Properties.Name): $($_.PSObject.Properties.Value)" }
} catch {
    Write-Host "❌ Main API test failed: $_" -ForegroundColor Red
}

# Test login endpoint with sample data
Write-Host "`nTesting login endpoint..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "sarah.johnson@citygeneral.com"
        password = "doctor123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BackendUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login endpoint works with sample data" -ForegroundColor Green
    Write-Host "Sample doctor login successful!" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login test failed (this is expected if database is not seeded): $_" -ForegroundColor Yellow
    Write-Host "You may need to seed the database with sample data" -ForegroundColor Yellow
}

Write-Host "`n🎉 Backend deployment testing completed!" -ForegroundColor Green
