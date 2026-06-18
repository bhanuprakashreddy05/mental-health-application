# Peaceful Mind - AI Mental Health & Wellness Web Application

[![Peaceful Mind CI/CD Pipeline](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/actions)

Create a modern, responsive web application for desktop and mobile browsers supporting emotion tracking, mood charts, private diary logs with AI summarization, AI chat companion, self-care exercise players, and profile configurations.

## Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b35397a5-9442-4d4f-8337-732c31781908

## Run Locally

**Prerequisites:**  [Android Studio](https://developer.android.com/studio)


1. Open Android Studio
2. Select **Open** and choose the directory containing this project
3. Allow Android Studio to fix any incompatibilities as it imports the project.
4. Create a file named `.env` in the project directory and set `GEMINI_API_KEY` in that file to your Gemini API key (see `.env.example` for an example)
5. Remove this line from the app's `build.gradle.kts` file: `signingConfig = signingConfigs.getByName("debugConfig")`
6. Run the app on an emulator or physical device
