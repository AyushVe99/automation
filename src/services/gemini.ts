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
    const fallbackHashtags = post.series === 'dsa' 
      ? '#dsa #datastructures #algorithms #coding #100daysofcode'
      : post.series === 'js-arch'
      ? '#javascript #webdev #frontend #javascriptdeveloper #jsarchitecture #codinglife #webdevelopment'
      : '#javascript #webdev #coding #100daysofcode';
      
    if (post.series === 'js-arch') {
      return `Day ${post.day} of JavaScript Masterclass 🚀\n\nTopic: ${post.title}\n\n${post.hook_text}\n\nSwipe left to dive deep into how this works under the hood! 🧠\n\n💡 Question of the Day: Have you ever used this concept in a real project? Let me know below! 👇\n\nSave this for later 📌 and follow @debugwithayush for daily JS architecture content!\n\n${fallbackHashtags}`;
    }
    
    return `Day ${post.day} of 100 Days of ${post.series.toUpperCase()} 🚀\n\nTopic: ${post.title}\n\nSwipe to see the optimal approach and code! 👉\n\n💡 Question of the Day: What time complexity did you get for your solution? Drop it in the comments below! 👇\n\n${fallbackHashtags}`;
  }

  try {
    let prompt = '';
    
    if (post.series === 'js-arch') {
      prompt = `
You are an expert JavaScript developer running an educational Masterclass series on Instagram.
Generate a highly engaging Instagram caption for the following JavaScript topic.

Day: ${post.day}
Topic: ${post.title}
Module: ${post.module_name || 'JavaScript Masterclass'}
Hook: ${post.hook_text || ''}

Requirements:
- Start the caption with exactly: "Day ${post.day} of JavaScript Masterclass 🚀"
- Educational and professional tone
- Include an engagement hook (e.g., "Save this post for later 📌" or "Have you used this in production? 👇")
- Include exactly 15 highly relevant hashtags (e.g., #javascript #webdevelopment #frontenddeveloper #jsarchitecture #coding)
- Keep it concise but valuable
- Do not repeat the exact code, focus on the concept

Return ONLY the caption text.
      `;
    } else {
      prompt = `
You are an expert developer running a "100 Days of Code" series on Instagram.
Generate a highly engaging Instagram caption for the following ${post.series.toUpperCase()} question.

Day: ${post.day}
Topic: ${post.title}
Difficulty: ${post.difficulty}
Question: ${post.question || ''}
Answer: ${post.answer || ''}
Explanation: ${post.explanation || ''}
${(post as any).questions_json ? `Multiple Questions Data: ${(post as any).questions_json}` : ''}

Requirements:
- Start the caption with exactly: "Day ${post.day} of 100 Days of ${post.series.toUpperCase()} 🚀"
- Educational and beginner friendly
- EXPLICITLY state the Answer(s) and the Explanation(s) in the caption clearly! This is where the users will read the solution since it is NOT on the image slide.
- Include an engagement hook (e.g., "Did you guess correctly before checking the caption? Let me know! 👇")
- Include 10-15 relevant hashtags for ${post.series.toUpperCase()} and coding
- Keep it structured and easy to read using emojis
- Do not repeat the exact code, focus on the concept
- CRITICAL INSTAGRAM LIMIT: Your entire caption MUST be under 2000 characters. If the explanation is very long, summarize it concisely so it fits easily within the limit.

Return ONLY the caption text.
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('No text returned from Gemini API');
    }

    let finalCaption = response.text.trim();
    if (finalCaption.length > 2150) {
      // Instagram's hard limit is 2200. If we somehow exceeded it, forcefully slice it.
      logger.warn(`Caption length ${finalCaption.length} exceeds limits, forcefully truncating.`);
      finalCaption = finalCaption.substring(0, 2150) + '...';
    }

    return finalCaption;
  } catch (err: any) {
    logger.error('Error generating caption with Gemini, falling back to local:', err.message);
    const fallbackHashtags = post.series === 'dsa' 
      ? '#dsa #datastructures #algorithms #coding #100daysofcode'
      : post.series === 'js-arch'
      ? '#javascript #webdev #frontend #javascriptdeveloper #jsarchitecture #codinglife #webdevelopment'
      : '#javascript #webdev #coding #100daysofcode';
      
    if (post.series === 'js-arch') {
      return `Day ${post.day} of JavaScript Masterclass 🚀\n\nTopic: ${post.title}\n\n${post.hook_text}\n\nSwipe left to dive deep into how this works under the hood! 🧠\n\n💡 Question of the Day: Have you ever used this concept in a real project? Let me know below! 👇\n\nSave this for later 📌 and follow @debugwithayush for daily JS architecture content!\n\n${fallbackHashtags}`;
    }
    
    return `Day ${post.day} of 100 Days of ${post.series.toUpperCase()} 🚀\n\nTopic: ${post.title}\n\nSwipe to see the optimal approach and code! 👉\n\n💡 Question of the Day: What time complexity did you get for your solution? Drop it in the comments below! 👇\n\n${fallbackHashtags}`;
  }
}
