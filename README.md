# Peaceful Mind - AI Mental Health & Wellness Web Application

[![Peaceful Mind CI/CD Pipeline](https://github.com/bhanuprakashreddy05/mental-health-application/actions/workflows/ci.yml/badge.svg)](https://github.com/bhanuprakashreddy05/mental-health-application/actions)

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

## CI/CD Pipeline

This project includes a fully automated production-ready CI/CD pipeline built with **GitHub Actions**.

### GitHub Actions Workflow
The workflow is defined in [.github/workflows/ci.yml](file:///.github/workflows/ci.yml) and is triggered automatically on:
- Any `push` to the `main` branch.
- Any `pull_request` targeting the `main` branch.

### Pipeline Stages
1. **Checkout & Node Setup**: Pulls down the repository code and configures the latest LTS Node.js environment, enabling built-in npm caching to speed up subsequent runs.
2. **Install Dependencies**: Sequentially installs both the frontend (React/Vite) and backend (Express) npm packages using fallback-safe routines.
3. **Lint & Code Quality**: Executes lint checks using ESLint for both projects if configured, preventing potential runtime syntax and style issues.
4. **Automated Testing**:
   - Runs unit tests in the frontend via Vitest.
   - Runs backend integration tests via the custom verification runner.
   - Provides a fallback smoke test configuration to guarantee execution when directories or scripts are absent.
5. **Build Verification**: Compiles the frontend code for production using Vite.
6. **Firebase Validation**: Validates the JSON schema and formatting of `firebase.json` and `.firebaserc` config files without exposing secrets.
7. **Artifact Archiving**: Packages and uploads compiled frontend build assets (`frontend/dist/`) as a workflow run artifact for deployment.

### How to View Results
1. Navigate to the **Actions** tab in your GitHub repository.
2. Click on the latest run under **Peaceful Mind CI Pipeline**.
3. You can inspect logs for each job and download the compiled build artifacts.
