# 100 Days Content Automation

A fully automated, zero-cost (excluding optional OpenAI/Gemini API) Node.js application to generate, schedule, and publish educational code series on Instagram.

## Core Series
The platform currently supports multiple automated content pipelines:
1. **JavaScript A-Z (js-arch):** A premium, 150+ topic masterclass covering JS architecture, internals, and concepts. Features a high-quality 3D dark/yellow aesthetic with smart conditional rendering (only shows code blocks if needed) and SVG hand-drawn diagrams.
2. **DSA 100 Days (dsa):** A daily Data Structures & Algorithms coding challenge series.
3. **Legacy JavaScript 100 Days (javascript):** The classic 100 days of JS coding challenge series.

## Features
- **Local Dataset First:** Runs off a generated SQLite database containing hundreds of high-quality topics/questions.
- **Premium Image Generation:** Uses Puppeteer, HTML/CSS, and Prism.js for beautiful, syntax-highlighted 1080x1350 multi-slide carousels.
- **Dynamic Slide Calculation:** The image generator intelligently determines how many slides to capture based on the specific content of the post (e.g., hiding empty code slides).
- **Instagram Graph API Integration:** Automatically publishes directly to your Instagram account.
- **GitHub Actions First:** Designed to run automatically via GitHub Actions Cron, committing the state back to the repository so you don't need a hosted database.
- **Zero Cost Deployment:** Runs entirely on GitHub and free-tier services.
- **AI Captions & Hashtags:** Uses Gemini to generate dynamic, highly engaging captions and targeted hashtags on the fly.
- **Admin Dashboard:** A lightweight Express UI to track progress and manually trigger/preview posts.

## 🚀 Quick Start: Step-by-Step Guide

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

# Set DRY_RUN to true to test locally without actually publishing to Instagram
DRY_RUN=true

# --- Production / Integration (Fill these later for actual posting) ---
# Instagram Graph API Credentials
IG_USER_ID=your_ig_user_id
IG_ACCESS_TOKEN=your_long_lived_access_token

# Gemini API (Optional - for dynamic AI captions)
GEMINI_API_KEY=your_gemini_api_key
USE_GEMINI=true
```

### Step 5: Generate the Database
Before running the app, you need to generate the dataset for your desired series using Gemini. Run the specific script for your series:

**For the Premium JS Architecture Masterclass:**
```bash
npx tsx scripts/generate-jsarch-dataset.ts
```

**For the DSA / General JS Series:**
```bash
npx tsx scripts/generate-dsa-dataset.ts
npx tsx scripts/generate-dataset.ts
```
*(This will populate `database.sqlite` with the selected questions/topics.)*

### Step 6: Start the Local Dashboard
Run the local admin dashboard with:
```bash
npm run dev
```
- Open your browser and navigate to: **http://localhost:3000**
- Here you can view upcoming posts, preview images, and manage your content.

### Step 7: Test a Post Manually
If you want to test the post generation locally, open a new terminal window and run:

**For JS Architecture:**
```bash
npm run post:jsarch
```

**For DSA:**
```bash
npm run post:dsa
```
*(Make sure `DRY_RUN=true` in your `.env` so it doesn't actually post to Instagram. It will just generate the images locally for you to verify).*

## Deployment via GitHub Actions (Zero-Cost Setup)

This project is built to run effortlessly on GitHub Actions for free.

1. Push your code to a private GitHub repository. **Make sure you commit `database.sqlite` after generating the dataset.**
2. In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
3. Add the following Repository Secrets:
   - `IG_USER_ID`
   - `IG_ACCESS_TOKEN`
   - `GEMINI_API_KEY`
4. Go to **Settings > Actions > General** and under **Workflow permissions**, ensure **Read and write permissions** is selected. This allows the bot to commit the updated `database.sqlite` back to the repository after a successful post.
5. The scheduled workflows (`jsarch-post.yml` and `dsa-post.yml`) will now automatically generate and publish the content daily.

## Resetting the Database
If you ran tests locally and want to reset the database so your automated jobs start from Day 1 again, run:
```bash
node scripts/reset-db.js
```

## Instagram Setup
1. Create a Facebook Page and link it to an Instagram Professional/Creator account.
2. Go to the [Meta for Developers](https://developers.facebook.com/) portal and create an app.
3. Add the **Instagram Graph API** product.
4. Generate a User Access Token with `instagram_basic`, `instagram_content_publish`, and `pages_show_list` permissions.
5. Extend the token to a long-lived access token and save it in `IG_ACCESS_TOKEN`.
6. Get your Instagram User ID by querying the Graph API and save it in `IG_USER_ID`.
