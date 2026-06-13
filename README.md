# 100 Days Content Automation

A fully automated, zero-cost (excluding optional OpenAI API) Node.js application to generate, schedule, and publish a "100 Days of Code" series on Instagram.

## Features
- **Local Dataset First:** Runs off a generated SQLite database of 100 high-quality JavaScript interview questions.
- **Automated Image Generation:** Uses Puppeteer, HTML/CSS, and Prism.js for beautiful, syntax-highlighted 1080x1350 images.
- **Instagram Graph API Integration:** Automatically publishes directly to your Instagram account.
- **GitHub Actions First:** Designed to run automatically via GitHub Actions Cron, committing the state back to the repository so you don't need a hosted database.
- **Zero Cost Deployment:** Runs entirely on GitHub and free-tier services.
- **Optional AI Enhancements:** Toggle Gemini to generate dynamic, highly engaging captions on the fly.
- **Admin Dashboard:** A lightweight Express UI to track progress and manually trigger posts.

## 🚀 Quick Start: Step-by-Step Guide

Follow these instructions to run the project locally without any extra effort:

### Step 1: Prerequisites
- Ensure you have **Node.js** (v18 or higher) installed. [Download Node.js here](https://nodejs.org/).
- Ensure you have **Git** installed.

### Step 2: Clone the Repository
Open your terminal and run:
```bash
git clone <your-repo-url>
cd 100-days-content-automation
```

### Step 3: Install Dependencies
Install all the required NPM packages:
```bash
npm install
```

### Step 4: Configure Environment Variables
1. In the project root, create a file named exactly `.env`.
2. Copy and paste the following variables into your `.env` file:

```env
# --- Local Development ---
# Port for local Dashboard
PORT=3000

# Active Series
SERIES=javascript

# Set DRY_RUN to true to test locally without actually publishing to Instagram
DRY_RUN=true

# --- Production / Integration (Fill these later for actual posting) ---
# Instagram Graph API Credentials
IG_USER_ID=your_ig_user_id
IG_ACCESS_TOKEN=your_long_lived_access_token

# Gemini API (Optional - for dynamic AI captions)
GEMINI_API_KEY=your_gemini_api_key
USE_GEMINI=false
```

### Step 5: Generate the Database
Before running the app, you need to generate the "100 Days" dataset. Run this command:
```bash
npm run generate
```
*(This will create a `database.sqlite` file populated with 100 JavaScript questions.)*

### Step 6: Start the Project
Run the local admin dashboard with:
```bash
npm run dev
```
- Open your browser and navigate to: **http://localhost:3000**
- Here you can view upcoming posts, preview images, and manage your content.

### Step 7: Test a Post Manually
If you want to test the post generation locally, open a new terminal window and run:
```bash
npm run post
```
*(Make sure `DRY_RUN=true` in your `.env` so it doesn't try to post to Instagram. It will just generate the image and mark it as posted in your local DB).*

## Deployment via GitHub Actions (Zero-Cost Setup)

This project is built to run effortlessly on GitHub Actions for free.

1. Push your code to a private GitHub repository. **Make sure you commit `database.sqlite` after running `npm run generate`.**
2. In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
3. Add the following Repository Secrets:
   - `IG_USER_ID`
   - `IG_ACCESS_TOKEN`
   - `GEMINI_API_KEY` (Optional)
   - `USE_GEMINI` (Set to `false` or `true`)
   - `SERIES` (Set to `javascript`)
4. Go to **Settings > Actions > General** and under **Workflow permissions**, ensure **Read and write permissions** is selected. This allows the bot to commit the updated `database.sqlite` back to the repository after a successful post.
5. The job is scheduled to run daily at 03:30 UTC (9:00 AM IST) in `.github/workflows/post.yml`. You can also trigger it manually from the Actions tab.

## Instagram Setup
1. Create a Facebook Page and link it to an Instagram Professional/Creator account.
2. Go to the [Meta for Developers](https://developers.facebook.com/) portal and create an app.
3. Add the **Instagram Graph API** product.
4. Generate a User Access Token with `instagram_basic`, `instagram_content_publish`, and `pages_show_list` permissions.
5. Extend the token to a long-lived access token and save it in `IG_ACCESS_TOKEN`.
6. Get your Instagram User ID by querying the Graph API and save it in `IG_USER_ID`.

## Adding More Series
To add "100 Days of React":
1. Duplicate `scripts/generate-dataset.js` to create React questions.
2. Ensure the `series` field is set to `react`.
3. Change the `SERIES=react` in your `.env` or GitHub Secrets.
