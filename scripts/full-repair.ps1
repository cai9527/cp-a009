Write-Host "=== Step 1: 删除损坏的 node_modules ===" -ForegroundColor Cyan
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Write-Host "node_modules 已删除" -ForegroundColor Green
}

Write-Host "=== Step 2: 删除 package-lock.json ===" -ForegroundColor Cyan
if (Test-Path package-lock.json) {
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
    Write-Host "package-lock.json 已删除" -ForegroundColor Green
}

Write-Host "=== Step 3: 清除 npm 缓存 ===" -ForegroundColor Cyan
npm cache clean --force 2>$null
Write-Host "缓存已清除" -ForegroundColor Green

Write-Host "=== Step 4: 完整安装依赖 (需要几分钟) ===" -ForegroundColor Cyan
npm install --legacy-peer-deps --no-audit --no-fund
if ($LASTEXITCODE -ne 0) {
    Write-Host "依赖安装失败，退出代码: $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
Write-Host "依赖安装完成!" -ForegroundColor Green

Write-Host "=== Step 5: 修复 Ajv 兼容性问题 ===" -ForegroundColor Cyan
node scripts/fix-ajv-compat.js

Write-Host "=== Step 6: 测试 Taro CLI 是否可用 ===" -ForegroundColor Cyan
npx taro --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Taro CLI 仍然无法运行!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Green
Write-Host "✅ 所有修复完成！现在可以构建项目了" -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
