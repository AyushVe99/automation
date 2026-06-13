import express from 'express';
import localtunnel from 'localtunnel';
import path from 'path';
import { fileURLToPath } from 'url';
import { postRepository, Post } from '../repositories/post.repository.js';
import { generateImage } from '../generators/image-generator.js';
import { generateCaption } from './gemini.js';
import { publishToInstagram } from './instagram.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function processNextPost(): Promise<Post | undefined> {
  const series = env.SERIES;
  const post = await postRepository.getNextUnpublishedPost(series);

  if (!post) {
    logger.info(`No unpublished posts found for series: ${series}`);
    return undefined;
  }

  logger.info(`Processing Post: Day ${post.day} of ${series}`);

  const imagePath = await generateImage(post);
  logger.info(`Image generated at: ${imagePath}`);

  const app = express();
  app.use('/generated', express.static(path.resolve(__dirname, '../../generated')));
  
  let server: any;
  let tunnel: any;
  
  try {
    const port = 3000 + Math.floor(Math.random() * 1000);
    server = app.listen(port);
    tunnel = await localtunnel({ port });
    logger.info(`Localtunnel started: ${tunnel.url}`);

    const publicImageUrl = `${tunnel.url}/generated/posts/${post.series}-day-${post.day}.png`;

    const caption = await generateCaption(post);

    let igPostId = 'dry-run-id';
    if (env.DRY_RUN !== 'true') {
      igPostId = await publishToInstagram(publicImageUrl, caption);
    } else {
      logger.info('DRY_RUN=true. Skipping actual Instagram post.');
    }

    await postRepository.markPostAsPublished(post.id, igPostId, caption);

    logger.info(`Successfully completed Day ${post.day}!`);
    return post;

  } catch (err: any) {
    logger.error(`Failed to process Day ${post.day}:`, err.message);
    throw err;
  } finally {
    if (tunnel) tunnel.close();
    if (server) server.close();
  }
}
