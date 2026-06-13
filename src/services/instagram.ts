import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const IG_API_BASE = 'https://graph.facebook.com/v25.0';

export async function publishToInstagram(imageUrlOrUrls: string | string[], caption: string): Promise<string> {
  const userId = env.IG_USER_ID;
  const accessToken = env.IG_ACCESS_TOKEN;

  if (!userId || !accessToken) {
    throw new Error('IG_USER_ID or IG_ACCESS_TOKEN is missing in environment variables');
  }

  try {
    const urls = Array.isArray(imageUrlOrUrls) ? imageUrlOrUrls : [imageUrlOrUrls];

    if (urls.length === 1) {
      logger.info(`Creating media container for image URL: ${urls[0]}...`);
      const containerRes = await axios.post(`${IG_API_BASE}/${userId}/media`, null, {
        params: {
          image_url: urls[0],
          caption: caption,
          access_token: accessToken,
        }
      });

      const creationId = containerRes.data.id;
      logger.info(`Media container created: ${creationId}. Waiting before publishing...`);

      // Wait a few seconds for Instagram to process the image
      await new Promise(resolve => setTimeout(resolve, 5000));

      logger.info(`Publishing media ${creationId}...`);
      const publishRes = await axios.post(`${IG_API_BASE}/${userId}/media_publish`, null, {
        params: {
          creation_id: creationId,
          access_token: accessToken,
        }
      });

      const publishedId = publishRes.data.id;
      logger.info(`Successfully published post to Instagram! ID: ${publishedId}`);
      return publishedId;
    } else {
      logger.info(`Creating carousel item containers for ${urls.length} images...`);
      const itemIds: string[] = [];
      for (const url of urls) {
        const itemRes = await axios.post(`${IG_API_BASE}/${userId}/media`, null, {
          params: {
            image_url: url,
            is_carousel_item: 'true',
            access_token: accessToken,
          }
        });
        itemIds.push(itemRes.data.id);
      }

      logger.info(`Carousel items created: ${itemIds.join(', ')}. Creating carousel container...`);
      const containerRes = await axios.post(`${IG_API_BASE}/${userId}/media`, null, {
        params: {
          media_type: 'CAROUSEL',
          children: itemIds.join(','),
          caption: caption,
          access_token: accessToken,
        }
      });

      const creationId = containerRes.data.id;
      logger.info(`Carousel container created: ${creationId}. Waiting before publishing...`);

      await new Promise(resolve => setTimeout(resolve, 5000));

      logger.info(`Publishing carousel ${creationId}...`);
      const publishRes = await axios.post(`${IG_API_BASE}/${userId}/media_publish`, null, {
        params: {
          creation_id: creationId,
          access_token: accessToken,
        }
      });

      const publishedId = publishRes.data.id;
      logger.info(`Successfully published carousel to Instagram! ID: ${publishedId}`);
      return publishedId;
    }

  } catch (err: any) {
    logger.error('Error interacting with Instagram API:');
    if (err.response) {
      logger.error(err.response.data);
      throw new Error(err.response.data.error?.message || 'Instagram API Error');
    }
    throw err;
  }
}
