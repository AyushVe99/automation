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

function getCompanyBadgesHTML(title: string): string {
  const t = title.toLowerCase();
  const companies = [];
  
  // Assign 2-3 companies based on title heuristics to look authentic
  companies.push({ name: 'Google', class: 'google', icon: '🔍' });
  
  if (t.includes('stock') || t.includes('merge') || t.includes('lru') || t.includes('search') || t.includes('array') || t.includes('linked list')) {
    companies.push({ name: 'Amazon', class: 'amazon', icon: '📦' });
  }
  
  if (t.includes('tree') || t.includes('graph') || t.includes('sum') || t.includes('clone') || t.includes('string')) {
    companies.push({ name: 'Meta', class: 'meta', icon: '♾️' });
  }
  
  if (companies.length < 2) {
    companies.push({ name: 'Microsoft', class: 'microsoft', icon: '🪟' });
  } else if (t.includes('dynamic') || t.includes('matrix')) {
    companies.push({ name: 'Apple', class: 'apple', icon: '🍎' });
  }

  const html = companies.map(c => `<div class="company-badge ${c.class}">${c.icon} ${c.name}</div>`).join('');
  return `<div class="companies-container">${html}</div>`;
}

export async function generateImage(post: Post): Promise<string[]> {
  const isDSA = post.series === 'dsa';
  const isJsArch = post.series === 'js-arch';
  const isFaangDsa = post.series === 'faang-dsa';
  const templateName = isJsArch ? 'jsarch-post.html' : isFaangDsa ? 'faang-dsa-post.html' : isDSA ? 'dsa-post.html' : 'post.html';
  const templatePath = path.resolve(__dirname, `../templates/${templateName}`);
  let html = await fs.readFile(templatePath, 'utf8');

  // Replace placeholders
  html = html.replace(/{{SERIES}}/g, post.series.charAt(0).toUpperCase() + post.series.slice(1));
  html = html.replace(/{{DAY}}/g, post.day.toString());
  html = html.replace(/{{TITLE}}/g, escapeHtml(post.title));
  html = html.replace(/{{CODE}}/g, escapeHtml(post.code || ''));
  html = html.replace(/{{DIFFICULTY}}/g, escapeHtml(post.difficulty));
  
  if (isDSA) {
    html = html.replace(/{{COMPANIES_HTML}}/g, getCompanyBadgesHTML(post.title));
    html = html.replace(/{{QUESTION}}/g, escapeHtml(post.question || ''));
    html = html.replace(/{{BRUTE_FORCE}}/g, escapeHtml(post.brute_force_code || '// No brute force code provided'));
    html = html.replace(/{{OPTIMAL}}/g, escapeHtml(post.optimal_code || '// No optimal code provided'));
    html = html.replace(/{{INPUT}}/g, escapeHtml(post.example_input || 'N/A'));
    html = html.replace(/{{OUTPUT}}/g, escapeHtml(post.example_output || 'N/A'));
    html = html.replace(/{{APPROACH_EXPLANATION}}/g, escapeHtml(post.explanation || 'Think about how to solve this step by step.'));
    
    // Complexities
    html = html.replace(/{{BRUTE_TIME}}/g, escapeHtml(post.brute_time || 'O(n)'));
    html = html.replace(/{{BRUTE_SPACE}}/g, escapeHtml(post.brute_space || 'O(1)'));
    html = html.replace(/{{OPTIMAL_TIME}}/g, escapeHtml(post.optimal_time || 'O(n)'));
    html = html.replace(/{{OPTIMAL_SPACE}}/g, escapeHtml(post.optimal_space || 'O(1)'));
  }

  if (isJsArch || isFaangDsa) {
    html = html.replace(/{{MODULE_NAME}}/g, escapeHtml(post.module_name || 'JavaScript Masterclass'));
    html = html.replace(/{{HOOK_TEXT}}/g, escapeHtml(post.hook_text || ''));
    html = html.replace(/{{EXPLANATION_1}}/g, post.explanation_1 || ''); // Allow HTML in explanations for bold tags
    html = html.replace(/{{EXPLANATION_2}}/g, post.explanation_2 || '');
    html = html.replace(/{{REAL_WORLD_USECASE}}/g, escapeHtml(post.real_world_usecase || ''));
    html = html.replace(/{{COMMON_EDGE_CASES}}/g, escapeHtml(post.common_edge_cases || ''));
    html = html.replace(/{{INTERVIEW_QUESTION}}/g, escapeHtml(post.interview_question || ''));
    html = html.replace(/{{PRO_TIP}}/g, escapeHtml(post.pro_tip || 'Keep coding!'));
  }
  
  if (isFaangDsa) {
    html = html.replace(/{{COMPANIES_HTML}}/g, getCompanyBadgesHTML(post.title));
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
    
    if (isDSA || isJsArch || isFaangDsa) {
      const paths: string[] = [];
      
      // Determine how many slides we have
      let totalSlides = await page.evaluate(() => {
        return typeof (window as any).getTotalSlides === 'function' 
          ? (window as any).getTotalSlides() 
          : 4; // fallback
      });

      for (let i = 0; i < totalSlides; i++) {
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
