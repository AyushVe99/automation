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

function formatText(text: string): string {
    if (!text) return '';
    let formatted = escapeHtml(text);
    
    // Multi-line code blocks
    formatted = formatted.replace(/```(?:\w+)?\n([\s\S]*?)```/g, (match, p1) => {
        return `</p><div class="code-container" style="padding: 20px; margin: 20px 0; border-radius: 16px;"><pre><code class="language-javascript">${p1.trim()}</code></pre></div><p style="margin-bottom: 15px;">`;
    });
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 8px; font-family: \'JetBrains Mono\', monospace; color: #fde047; font-size: 0.9em; border: 1px solid rgba(255,255,255,0.1);">$1</code>');
    
    // Bold text
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #38bdf8;">$1</strong>');
    
    // Line breaks to paragraphs
    formatted = '<p style="margin-bottom: 15px;">' + formatted.replace(/\n\n+/g, '</p><p style="margin-bottom: 15px;">') + '</p>';
    
    // Cleanup empty paragraphs created by regex
    formatted = formatted.replace(/<p[^>]*>\s*<\/p>/g, '');
    
    return formatted;
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
  if (!isDSA && !isJsArch && !isFaangDsa) {
    let slidesHtml = '';
    try {
      const questions = JSON.parse((post as any).questions_json || '[]');
      if (Array.isArray(questions) && questions.length > 0) {
        questions.forEach((q, index) => {
          slidesHtml += `
            <div class="slide" data-slide="true">
              <div class="header">
                <div class="series-badge">100 Days of ${post.series.charAt(0).toUpperCase() + post.series.slice(1)}</div>
                <div class="day-badge">Day ${post.day}</div>
              </div>
              
              <div class="content">
                <h1 class="question-title"><span style="color: #a855f7; margin-right: 15px;">Q${index + 1}:</span>${escapeHtml(q.question || q.title)}</h1>
                
                <div class="code-container">
                  <div class="mac-buttons">
                    <div class="mac-btn mac-close"></div>
                    <div class="mac-btn mac-min"></div>
                    <div class="mac-btn mac-max"></div>
                  </div>
                  <pre><code class="language-javascript">${escapeHtml(q.code || '')}</code></pre>
                </div>
                
                <div class="caption-cta" style="margin-top: 50px; text-align: center;">
                  <div style="background: rgba(168, 85, 247, 0.15); border: 2px solid rgba(168, 85, 247, 0.4); padding: 20px 40px; border-radius: 50px; font-size: 32px; font-weight: 800; color: #d8b4fe; display: inline-flex; align-items: center; gap: 15px; box-shadow: 0 10px 25px rgba(168, 85, 247, 0.1);">
                    <span style="font-size: 40px;">👇</span> Check caption for the answer & explanation!
                  </div>
                </div>
              </div>
            </div>
          `;
        });
      } else {
        // Fallback to original single slide if no array found
        slidesHtml = `
          <div class="slide" data-slide="true">
            <div class="header">
              <div class="series-badge">100 Days of ${post.series.charAt(0).toUpperCase() + post.series.slice(1)}</div>
              <div class="day-badge">Day ${post.day}</div>
            </div>
            
            <div class="content">
              <h1 class="question-title"><span style="color: #a855f7; margin-right: 15px;">Q:</span>${escapeHtml(post.question || post.title)}</h1>
              
              <div class="code-container">
                <div class="mac-buttons">
                  <div class="mac-btn mac-close"></div>
                  <div class="mac-btn mac-min"></div>
                  <div class="mac-btn mac-max"></div>
                </div>
                <pre><code class="language-javascript">${escapeHtml(post.code || '')}</code></pre>
              </div>
              
              <div class="caption-cta" style="margin-top: 50px; text-align: center;">
                <div style="background: rgba(168, 85, 247, 0.15); border: 2px solid rgba(168, 85, 247, 0.4); padding: 20px 40px; border-radius: 50px; font-size: 32px; font-weight: 800; color: #d8b4fe; display: inline-flex; align-items: center; gap: 15px; box-shadow: 0 10px 25px rgba(168, 85, 247, 0.1);">
                  <span style="font-size: 40px;">👇</span> Check caption for the answer & explanation!
                </div>
              </div>
            </div>
          </div>
        `;
      }
    } catch {
      // Fallback
      slidesHtml = `<div>Error parsing questions.</div>`;
    }
    
    html = html.replace(/{{SLIDES_HTML}}/g, slidesHtml);
  }
  
  if (isDSA) {
    html = html.replace(/{{COMPANIES_HTML}}/g, getCompanyBadgesHTML(post.title));
    html = html.replace(/{{QUESTION}}/g, escapeHtml(post.question || ''));
    html = html.replace(/{{BRUTE_FORCE}}/g, escapeHtml(post.brute_force_code || '// No brute force code provided'));
    html = html.replace(/{{OPTIMAL}}/g, escapeHtml(post.optimal_code || '// No optimal code provided'));
    html = html.replace(/{{INPUT}}/g, escapeHtml(post.example_input || 'N/A'));
    html = html.replace(/{{OUTPUT}}/g, escapeHtml(post.example_output || 'N/A'));
    
    let approachSlidesHtml = '';
    
    // Core Idea Slide
    approachSlidesHtml += `
    <div class="slide" data-slide="true">
      <div class="slide-title">Approach (1/2)</div>
      <h1 class="main-title">${escapeHtml(post.title)}</h1>
      <div class="idea-card">
        <div class="card-header" style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
           <div style="background: rgba(52,211,153,0.2); padding: 15px; border-radius: 16px; border: 1px solid rgba(52,211,153,0.4);"><span style="font-size: 40px;">💡</span></div>
           <h2 style="color: #34d399; font-size: 48px; margin: 0; font-weight: 800; letter-spacing: 1px;">Core Idea</h2>
        </div>
        <div class="card-content" style="font-size: 34px; line-height: 1.6; color: #f8fafc; text-shadow: 0 2px 4px rgba(0,0,0,0.5); font-weight: 500;">
           ${formatText(post.explanation_1 || post.explanation || '')}
        </div>
      </div>
    </div>
    `;

    // Mechanics / Diagram Slide(s)
    let steps: string[] = [];
    let diagramHtml = '';
    try {
      const parsed = JSON.parse(post.explanation_2 || '{}');
      if (Array.isArray(parsed)) {
          steps = parsed;
      } else if (parsed && typeof parsed === 'object') {
          steps = Array.isArray(parsed.steps) ? parsed.steps : [];
          diagramHtml = parsed.diagram_html || '';
      } else {
          steps = [post.explanation_2 || ''];
      }
    } catch {
      steps = [post.explanation_2 || ''];
    }

    if (steps.length > 0 && steps[0] !== '') {
      const chunks = [];
      const chunkSize = diagramHtml ? 2 : 3;
      if (steps.length === 1 && !(post.explanation_2 || '').trim().startsWith('[')) {
          chunks.push(steps);
      } else {
          for (let i = 0; i < steps.length; i += chunkSize) {
            chunks.push(steps.slice(i, i + chunkSize));
          }
      }

      chunks.forEach((chunk, index) => {
         const items = chunk.length === 1 && chunk[0].includes('<') ? chunk[0] : 
            `<ul>` + 
            chunk.map(step => `<li>${formatText(step)}</li>`).join('') + 
            `</ul>`;
         
         approachSlidesHtml += `
          <div class="slide" data-slide="true">
            <div class="slide-title">Approach (2/2) ${chunks.length > 1 ? `(${index + 1}/${chunks.length})` : ''}</div>
            <h1 class="main-title">${escapeHtml(post.title)}</h1>
            <div class="mechanics-card">
              <div class="card-header" style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                 <div style="background: rgba(56,189,248,0.2); padding: 15px; border-radius: 16px; border: 1px solid rgba(56,189,248,0.4);"><span style="font-size: 40px;">⚙️</span></div>
                 <h2 style="color: #38bdf8; font-size: 48px; margin: 0; font-weight: 800; letter-spacing: 1px;">Mechanics</h2>
              </div>
              <div class="card-content" style="font-size: 34px; line-height: 1.6; color: #f8fafc; text-shadow: 0 2px 4px rgba(0,0,0,0.5); font-weight: 500;">
                 ${diagramHtml ? diagramHtml : ''}
                 ${items}
              </div>
            </div>
          </div>
         `;
      });
    }

    html = html.replace(/{{APPROACH_SLIDES_HTML}}/g, approachSlidesHtml);
    
    // Complexities
    html = html.replace(/{{BRUTE_TIME}}/g, escapeHtml(post.brute_time || 'O(n)'));
    html = html.replace(/{{BRUTE_SPACE}}/g, escapeHtml(post.brute_space || 'O(1)'));
    html = html.replace(/{{OPTIMAL_TIME}}/g, escapeHtml(post.optimal_time || 'O(n)'));
    html = html.replace(/{{OPTIMAL_SPACE}}/g, escapeHtml(post.optimal_space || 'O(1)'));
  }

  if (isJsArch || isFaangDsa) {
    html = html.replace(/{{MODULE_NAME}}/g, escapeHtml(post.module_name || 'JavaScript Masterclass'));
    html = html.replace(/{{HOOK_TEXT}}/g, escapeHtml(post.hook_text || ''));
    html = html.replace(/{{EXPLANATION_1}}/g, formatText(post.explanation_1 || ''));
    
    // For js-arch, explanation_2 might be a JSON object with a mermaid_diagram now.
    let explanation2Text = post.explanation_2 || '';
    let mermaidDiagram = '';
    try {
      const parsed = JSON.parse(post.explanation_2 || '{}');
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        explanation2Text = parsed.text || '';
        mermaidDiagram = parsed.mermaid_diagram || '';
      }
    } catch {
      // it's just text
    }

    html = html.replace(/{{EXPLANATION_2}}/g, formatText(explanation2Text || ''));
    if (mermaidDiagram) {
      html = html.replace(/{{MERMAID_DIAGRAM_HTML}}/g, `<div style="display:flex; justify-content:center; margin-top:30px;"><div class="mermaid">${escapeHtml(mermaidDiagram)}</div></div>`);
    } else {
      html = html.replace(/{{MERMAID_DIAGRAM_HTML}}/g, '');
    }
    
    html = html.replace(/{{REAL_WORLD_USECASE}}/g, formatText(post.real_world_usecase || ''));
    html = html.replace(/{{COMMON_EDGE_CASES}}/g, formatText(post.common_edge_cases || ''));
    html = html.replace(/{{INTERVIEW_QUESTION}}/g, formatText(post.interview_question || ''));
    html = html.replace(/{{PRO_TIP}}/g, escapeHtml(post.pro_tip || 'Keep coding!'));
  }
  
  if (isFaangDsa) {
    html = html.replace(/{{COMPANIES_HTML}}/g, getCompanyBadgesHTML(post.title));
    
    let mechanicsSlidesHtml = '';
    let steps: string[] = [];
    let diagramHtml = '';
    try {
      const parsed = JSON.parse(post.explanation_2 || '{}');
      if (Array.isArray(parsed)) {
          steps = parsed;
      } else if (parsed && typeof parsed === 'object') {
          steps = Array.isArray(parsed.steps) ? parsed.steps : [];
          diagramHtml = parsed.diagram_html || '';
      } else {
          steps = [post.explanation_2 || ''];
      }
    } catch {
      steps = [post.explanation_2 || ''];
    }

    if (steps.length > 0 && steps[0] !== '') {
      const chunks = [];
      const chunkSize = diagramHtml ? 2 : 3;
      if (steps.length === 1 && !(post.explanation_2 || '').trim().startsWith('[')) {
          chunks.push(steps);
      } else {
          for (let i = 0; i < steps.length; i += chunkSize) {
            chunks.push(steps.slice(i, i + chunkSize));
          }
      }

      chunks.forEach((chunk, index) => {
         const items = chunk.length === 1 && chunk[0].includes('<') ? chunk[0] : 
            `<ul style="margin-left: 30px; font-size: 30px; padding-right: 10px;">` + 
            chunk.map(step => `<li style="margin-bottom: 12px;">${formatText(step)}</li>`).join('') + 
            `</ul>`;
         
         mechanicsSlidesHtml += `
          <div class="slide mechanics-slide" data-slide="true">
            <div class="slide-title">3. Under the Hood ${chunks.length > 1 ? `(${index + 1}/${chunks.length})` : ''}</div>
            <h1 class="main-title">${escapeHtml(post.title)}</h1>
            <div class="content-box">
              <h2>⚙️ Mechanics</h2>
              ${diagramHtml ? diagramHtml : ''}
              ${items}
            </div>
          </div>
         `;
      });
    } else {
      mechanicsSlidesHtml = `
          <div class="slide mechanics-slide" data-slide="true">
            <div class="slide-title">3. Under the Hood</div>
            <h1 class="main-title">${escapeHtml(post.title)}</h1>
            <div class="content-box">
              <h2>⚙️ Mechanics</h2>
              <div></div>
            </div>
          </div>
      `;
    }

    html = html.replace(/{{MECHANICS_SLIDES_HTML}}/g, mechanicsSlidesHtml);
    // Remove the unused fallback if any
    html = html.replace(/{{TITLE}}/g, escapeHtml(post.title)); // We added {{TITLE}} in the dynamic slides above
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
    
    const paths: string[] = [];
    
    // Determine how many slides we have
    let totalSlides = await page.evaluate(() => {
      return typeof (window as any).getTotalSlides === 'function' 
        ? (window as any).getTotalSlides() 
        : 1; // fallback to 1 if no slides found
    });

    for (let i = 0; i < totalSlides; i++) {
      // Evaluate script to show slide i
      await page.evaluate((index) => {
        if (typeof (window as any).showSlide === 'function') {
          (window as any).showSlide(index);
        }
      }, i);
      
      // Wait a bit for syntax highlighting or rendering if needed
      await new Promise(r => setTimeout(r, 100));
      
      // Render mermaid if function exists
      await page.evaluate(async () => {
         if ((window as any).renderMermaid) {
            await (window as any).renderMermaid();
         }
      });
      await new Promise(r => setTimeout(r, 100));
      
      const outPath = path.resolve(outputDir, `day-${post.day}-slide-${i + 1}.png`);
      await page.screenshot({ path: outPath, type: 'png' });
      paths.push(outPath);
    }

    return paths;
  } catch (err) {
    logger.error(err, 'Error generating image:');
    throw err;
  } finally {
    await browser.close();
  }
}
