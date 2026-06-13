import path from 'path';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import { postRepository, Post } from '../repositories/post.repository.js';
import { generateImage } from '../generators/image-generator.js';
import { generateCaption } from './gemini.js';
import { publishToInstagram } from './instagram.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadToTmpFiles(filePath: string): Promise<string> {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  const res = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
    headers: form.getHeaders()
  });
  return res.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
}

export async function processNextPost(seriesName: string = env.SERIES): Promise<Post | undefined> {
  const post = await postRepository.getNextUnpublishedPost(seriesName);

  if (!post) {
    logger.info(`No unpublished posts found for series: ${seriesName}`);
    return undefined;
  }

  logger.info(`Processing Post: Day ${post.day} of ${seriesName}`);

  const imagePaths = await generateImage(post);
  logger.info(`Images generated: ${imagePaths.join(', ')}`);

  try {
    logger.info('Uploading images to temporary hosting for Instagram...');
    const publicImageUrls: string[] = [];
    for (const p of imagePaths) {
      const url = await uploadToTmpFiles(p);
      publicImageUrls.push(url);
    }
    logger.info(`Temporary public URLs: ${publicImageUrls.join(', ')}`);

    const caption = await generateCaption(post);

    let igPostId = 'dry-run-id';
    if (env.DRY_RUN !== 'true') {
      igPostId = await publishToInstagram(publicImageUrls, caption);
    } else {
      logger.info('DRY_RUN=true. Skipping actual Instagram post.');
    }

    await postRepository.markPostAsPublished(post.id, igPostId, caption);

    logger.info(`Successfully completed Day ${post.day}!`);
    return post;

  } catch (err: any) {
    logger.error(`Failed to process Day ${post.day}:`, err.message);
    throw err;
  }
}
