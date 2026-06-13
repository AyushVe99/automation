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

export async function generateImage(post: Post): Promise<string> {
  const templatePath = path.resolve(__dirname, '../templates/post.html');
  let html = await fs.readFile(templatePath, 'utf8');

  // Replace placeholders
  html = html.replace('{{SERIES}}', post.series.charAt(0).toUpperCase() + post.series.slice(1));
  html = html.replace('{{DAY}}', post.day.toString());
  html = html.replace('{{TITLE}}', escapeHtml(post.title));
  html = html.replace('{{CODE}}', escapeHtml(post.code));
  html = html.replace('{{DIFFICULTY}}', escapeHtml(post.difficulty));

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
    
    const outputPath = path.join(outputDir, `${post.series}-day-${post.day}.png`);
    await page.screenshot({ path: outputPath, type: 'png' });
    
    return outputPath;
  } catch (err) {
    logger.error(err, 'Error generating image:');
    throw err;
  } finally {
    await browser.close();
  }
}
