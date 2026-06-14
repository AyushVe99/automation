import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dashboardService } from '../services/dashboard.service.js';
import { processNextPost } from '../services/poster.js';
import { generateImage } from '../generators/image-generator.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const idParamSchema = z.object({
  id: z.string().transform(val => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) throw new ValidationError('Invalid ID format');
    return parsed;
  })
});

export const renderDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await dashboardService.getDashboardData();
    const templatePath = path.resolve(__dirname, '../templates/dashboard.html');
    let html = await fs.readFile(templatePath, 'utf8');

    let rowsHtml = '';
    for (const post of data.posts) {
      const statusBadge = post.published 
        ? '<span class="badge badge-success">Published</span>' 
        : '<span class="badge badge-pending">Pending</span>';
      
      rowsHtml += `
        <tr>
          <td>${post.day}</td>
          <td>${post.title}</td>
          <td>${post.difficulty}</td>
          <td>${statusBadge}</td>
          <td>
            <a href="/post/${post.id}" class="btn btn-secondary">View</a>
            ${!post.published ? '<form action="/publish/' + post.id + '" method="POST" style="display:inline;"><button type="submit" class="btn">Publish</button></form>' : ''}
          </td>
        </tr>
      `;
    }

    html = html.replace('{{SERIES}}', data.series.toUpperCase());
    html = html.replace('{{TOTAL_DAYS}}', data.totalDays.toString());
    html = html.replace('{{PUBLISHED_COUNT}}', data.publishedCount.toString());
    html = html.replace('{{REMAINING_COUNT}}', data.remainingCount.toString());
    html = html.replace('{{TABLE_ROWS}}', rowsHtml);

    res.send(html);
  } catch (err) {
    next(err);
  }
};

export const renderPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const post = await dashboardService.getPostById(id);
    
    if (!post) {
      throw new NotFoundError('Post Not Found');
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Day ${post.day} - ${post.title}</title>
      <style>
        body { font-family: sans-serif; background: #f3f4f6; padding: 40px; }
        .card { background: white; padding: 30px; border-radius: 8px; max-width: 800px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .btn { display: inline-block; padding: 8px 16px; background: #e5e7eb; color: #374151; text-decoration: none; border-radius: 4px; margin-bottom: 20px;}
        pre { background: #1f2937; color: white; padding: 15px; border-radius: 5px; overflow-x: auto; }
      </style>
      </head>
      <body>
        <div class="card">
          <a href="/" class="btn">&larr; Back to Dashboard</a>
          <h1>Day ${post.day}: ${post.title}</h1>
          <p><strong>Difficulty:</strong> ${post.difficulty}</p>
          <h3>Code:</h3>
          <pre>${post.code}</pre>
          <h3>Explanation:</h3>
          <p>${post.explanation}</p>
          <h3>Caption:</h3>
          <pre>${post.caption || 'Not generated yet'}</pre>
          
          <div style="margin-top: 30px;">
            <a href="/generate-image/${post.id}" class="btn" target="_blank">Preview Image</a>
            ${!post.published ? `
              <form action="/publish/${post.id}" method="POST" style="display:inline;">
                <button type="submit" class="btn" style="background:#3b82f6; color:white; border:none; cursor:pointer;">Publish Now</button>
              </form>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    next(err);
  }
};

export const previewImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const post = await dashboardService.getPostById(id);
    if (!post) {
      throw new NotFoundError('Post Not Found');
    }

    const imagePaths = await generateImage(post);
    const imagePath = Array.isArray(imagePaths) ? imagePaths[0] : imagePaths;
    res.sendFile(imagePath);
  } catch (err) {
    next(err);
  }
};

export const publishPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const post = await dashboardService.getPostById(id);
    if (!post) {
      throw new NotFoundError('Post Not Found');
    }

    if (post.published) {
      throw new ValidationError('Post is already published');
    }

    await processNextPost();
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};

export const triggerJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await processNextPost();
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};
