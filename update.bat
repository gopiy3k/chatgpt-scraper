@echo off
cls
echo ===================================
echo  ChatGPT Scraper - Git Push Helper 
echo ===================================
echo.

:: Ask for a commit message
set /p commit_message="Enter your commit message: "

:: If no message is entered, use a default one
if "%commit_message%"=="" (
    set commit_message="Update scraper"
)

echo.
echo ===================================
echo.
echo Adding all changes...
git add .

echo.
echo Committing with message: "%commit_message%"
git commit -m "%commit_message%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ===================================
echo  Push complete!
echo ===================================
echo.

:: Pause to see the output before the window closes
pause