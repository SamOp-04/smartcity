@echo off
echo Cleaning Flutter project...

REM Delete build and tool folders
rmdir /s /q build
rmdir /s /q .dart_tool
rmdir /s /q .idea
rmdir /s /q .vscode
rmdir /s /q android\build
rmdir /s /q android\.gradle
rmdir /s /q ios\Pods
rmdir /s /q ios\.symlinks
rmdir /s /q ios\Flutter\Flutter.framework

REM Delete system files
del /q *.iml
del /q .DS_Store

echo ✅ Clean complete. Ready to zip.
pause
