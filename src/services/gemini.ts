import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { Post } from '../repositories/post.repository.js';

let ai: GoogleGenAI | null = null;
if (env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

export async function generateCaption(post: Post): Promise<string> {
  if (!ai || env.USE_GEMINI === 'false') {
    logger.info('Falling back to local caption generation');
    return `Day ${post.day} of 100 Days of ${post.series.charAt(0).toUpperCase() + post.series.slice(1)} 🚀\n\n${post.title}\n\nCan you predict the output before checking the answer? Comment below! 👇\n\nExplanation:\n${post.explanation}\n\n#javascript #100daysofcode #webdev #coding`;
  }

  try {
    const prompt = `
You are an expert developer running a "100 Days of Code" series on Instagram.
Generate a highly engaging Instagram caption for the following JavaScript question.

Topic: ${post.title}
Difficulty: ${post.difficulty}
Explanation: ${post.explanation}

Requirements:
- Educational and beginner friendly
- Include an engagement hook (e.g., "Comment your answer before checking the explanation 👇")
- Include 10-15 relevant hashtags
- Keep it concise but valuable
- Do not repeat the exact code, focus on the concept

Return ONLY the caption text.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('No text returned from Gemini API');
    }

    return response.text.trim();
  } catch (err: any) {
    logger.error('Error generating caption with Gemini, falling back to local:', err.message);
    return `Day ${post.day} of 100 Days of ${post.series.charAt(0).toUpperCase() + post.series.slice(1)} 🚀\n\n${post.title}\n\nCan you predict the output before checking the answer? Comment below! 👇\n\nExplanation:\n${post.explanation}\n\n#javascript #100daysofcode #webdev #coding`;
  }
}
