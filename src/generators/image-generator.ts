import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Post } from '../repositories/post.repository.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function generateImage(post: Post): Promise<string[]> {
  const isDSA = post.series === 'dsa';
  const templateName = isDSA ? 'dsa-post.html' : 'post.html';
  const templatePath = path.resolve(__dirname, `../templates/${templateName}`);
  let html = await fs.readFile(templatePath, 'utf8');

  // Replace placeholders
  html = html.replace(/{{SERIES}}/g, post.series.charAt(0).toUpperCase() + post.series.slice(1));
  html = html.replace(/{{DAY}}/g, post.day.toString());
  html = html.replace(/{{TITLE}}/g, escapeHtml(post.title));
  html = html.replace(/{{CODE}}/g, escapeHtml(post.code || ''));
  html = html.replace(/{{DIFFICULTY}}/g, escapeHtml(post.difficulty));
  
  if (isDSA) {
    html = html.replace(/{{QUESTION}}/g, escapeHtml(post.question || ''));
    html = html.replace(/{{BRUTE_FORCE}}/g, escapeHtml(post.brute_force_code || '// No brute force code provided'));
    html = html.replace(/{{OPTIMAL}}/g, escapeHtml(post.optimal_code || '// No optimal code provided'));
    html = html.replace(/{{INPUT}}/g, escapeHtml(post.example_input || 'N/A'));
    html = html.replace(/{{OUTPUT}}/g, escapeHtml(post.example_output || 'N/A'));
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const outputDir = path.resolve(__dirname, '../../generated/posts');
    await fs.mkdir(outputDir, { recursive: true });
    
    if (isDSA) {
      const paths: string[] = [];
      for (let i = 0; i < 4; i++) {
        // Evaluate script to show slide i
        await page.evaluate((index) => {
          (window as any).showSlide(index);
        }, i);
        
        // Wait a bit for syntax highlighting or rendering if needed
        await new Promise(r => setTimeout(r, 100));

        const outputPath = path.join(outputDir, `${post.series}-day-${post.day}-slide-${i + 1}.png`);
        await page.screenshot({ path: outputPath, type: 'png' });
        paths.push(outputPath);
      }
      return paths;
    } else {
      const outputPath = path.join(outputDir, `${post.series}-day-${post.day}.png`);
      await page.screenshot({ path: outputPath, type: 'png' });
      return [outputPath];
    }
  } catch (err) {
    logger.error(err, 'Error generating image:');
    throw err;
  } finally {
    await browser.close();
  }
}
