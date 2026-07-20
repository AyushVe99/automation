import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../src/db/index.js';
import { GoogleGenAI } from '@google/genai';
import { env } from '../src/config/env.js';
import { logger } from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKeys = [env.GEMINI_API_KEY, env.GEMINI_API_KEY_2, env.GEMINI_API_KEY_3].filter(Boolean) as string[];
if (apiKeys.length === 0) {
  logger.error('No GEMINI_API_KEY provided in environment variables.');
  process.exit(1);
}

let currentKeyIndex = 0;
let ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });

function rotateApiKey() {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  logger.info(`Switching to API key index ${currentKeyIndex}`);
  ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
}

// ============================================================
// Node.js Mastery Curriculum
// ============================================================
const modules = [
  {
    name: '1. Node.js Fundamentals',
    topics: [
      'What is Node.js?',
      'Why Node.js?',
      'How Node.js Works',
      'V8 Engine Explained',
      'Single Threaded but Non-Blocking',
      'The Event Loop',
      'Call Stack',
      'Callback Queue',
      'Microtasks vs Macrotasks',
      'libuv Explained',
      'Global Objects',
      'process Object',
      'process.nextTick()',
      'setImmediate()',
      'Timers',
      'CommonJS vs ES Modules',
      'package.json',
      'package-lock.json',
      'npm',
      'npx',
      'Semantic Versioning',
      'Environment Variables',
      'Node REPL',
    ],
  },

  {
    name: '2. Core Modules',
    topics: [
      'fs Module',
      'path Module',
      'os Module',
      'http Module',
      'https Module',
      'url Module',
      'crypto Module',
      'Buffer',
      'Streams',
      'Readable Streams',
      'Writable Streams',
      'Duplex Streams',
      'Transform Streams',
      'Pipe Method',
      'Events Module',
      'EventEmitter',
    ],
  },

  {
    name: '3. Express.js',
    topics: [
      'What is Express?',
      'Creating Your First Server',
      'Routing',
      'Request Object',
      'Response Object',
      'Route Parameters',
      'Query Parameters',
      'Middleware',
      'Middleware Order',
      'Built-in Middleware',
      'Custom Middleware',
      'Third-party Middleware',
      'Error Handling Middleware',
      'Express Router',
      'MVC Folder Structure',
      'REST API Design',
      'HTTP Methods',
      'Status Codes',
      'API Versioning',
    ],
  },

  {
    name: '4. Asynchronous JavaScript in Node',
    topics: [
      'Synchronous vs Asynchronous',
      'Callbacks',
      'Callback Hell',
      'Promises',
      'Promise Chaining',
      'Async/Await',
      'Promise.all',
      'Promise.allSettled',
      'Promise.race',
      'Promise.any',
      'util.promisify()',
      'Error Handling',
      'Unhandled Promise Rejection',
    ],
  },

  {
    name: '5. MongoDB & Mongoose',
    topics: [
      'SQL vs NoSQL',
      'Connecting MongoDB',
      'Mongoose',
      'Schema',
      'Model',
      'CRUD Operations',
      'Validation',
      'Indexes',
      'Compound Index',
      'Unique Index',
      'TTL Index',
      'Populate',
      'Aggregation Pipeline',
      'Transactions',
      'Pagination',
      'Soft Delete',
    ],
  },

  {
    name: '6. Authentication & Security',
    topics: [
      'Authentication vs Authorization',
      'Password Hashing (bcrypt)',
      'JWT',
      'Access Token vs Refresh Token',
      'Refresh Token Rotation',
      'Session Authentication',
      'Cookies',
      'HttpOnly Cookies',
      'CORS',
      'Helmet',
      'Rate Limiting',
      'Input Validation',
      'Data Sanitization',
      'CSRF',
      'XSS',
      'SQL/NoSQL Injection',
      'Environment Secrets',
    ],
  },

  {
    name: '7. Architecture & Best Practices',
    topics: [
      'MVC Architecture',
      'Service Layer Pattern',
      'Repository Pattern',
      'Controller Pattern',
      'Dependency Injection',
      'Folder Structure',
      'Environment Config',
      'Centralized Error Handling',
      'Async Error Wrapper',
      'Logging',
      'Winston Logger',
      'API Response Format',
      'Validation with Joi/Zod',
    ],
  },

  {
    name: '8. Performance & Scaling',
    topics: [
      'Node Performance',
      'Event Loop Blocking',
      'Cluster Module',
      'Worker Threads',
      'Child Process',
      'Redis Caching',
      'Caching Strategies',
      'Compression',
      'Memory Leaks',
      'Profiling',
      'PM2',
      'Load Balancing',
    ],
  },

  {
    name: '9. Real-Time Applications',
    topics: [
      'WebSockets',
      'Socket.IO',
      'Rooms',
      'Namespaces',
      'Broadcasting',
      'Private Messaging',
      'Presence Detection',
      'Typing Indicator',
    ],
  },

  {
    name: '10. File Handling',
    topics: [
      'Uploading Files',
      'Multer',
      'Serving Static Files',
      'Image Upload',
      'Cloudinary Integration',
      'AWS S3 Upload',
      'Streaming Large Files',
    ],
  },

  {
    name: '11. Testing',
    topics: [
      'Why Testing?',
      'Jest',
      'Supertest',
      'Unit Testing',
      'Integration Testing',
      'Mocking',
      'API Testing',
    ],
  },

  {
    name: '12. Deployment & Production',
    topics: [
      'Environment Variables',
      'Docker Basics',
      'Docker Compose',
      'NGINX Reverse Proxy',
      'PM2 Deployment',
      'CI/CD Basics',
      'Health Check Endpoint',
      'Graceful Shutdown',
      'Production Checklist',
    ],
  },

  {
    name: '13. Advanced Node.js',
    topics: [
      'GraphQL vs REST',
      'Apollo Server',
      'gRPC Basics',
      'Message Queues',
      'RabbitMQ',
      'Kafka Basics',
      'Cron Jobs',
      'BullMQ',
      'Microservices',
      'API Gateway',
    ],
  },
];

const allTopics = modules.flatMap(m => m.topics);

async function generateTopicContent(
  moduleName: string,
  topic: string,
  nextTopic: string,
  retries = 0
): Promise<any> {
  const prompt = `
You are a world-class Node.js and Backend educator creating premium Instagram learning content.

Topic: ${topic}
Module: ${moduleName}
Next Topic (for CTA): ${nextTopic}

Generate a JSON object with EXACTLY these fields:

{
  "hook_text": string,
  "explanation_1": array,
  "code": object,
  "explanation_2": object,
  "real_world_usecase": string,
  "common_edge_cases": string,
  "interview_question": string,
  "pro_tip": string,
  "difficulty": string
}

REQUIREMENTS:

1. hook_text
   - ONE sentence. Max 15 words.
   - Explain WHY this topic matters in plain English.
   - Use **word** syntax to bold 1-2 key terms.
   - Example: "Stop **blocking the event loop** with heavy calculations."

2. explanation_1 (WHAT & WHY bullets)
   - Return a JSON ARRAY of exactly 4 strings.
   - Each string = one bullet. Max 10 words per bullet.
   - Use **word** for emphasis. No HTML tags.
   - Example: ["A **single-threaded** non-blocking engine", "Handles **concurrent connections** easily", "Built on **Google V8 engine**", "Perfect for **I/O intensive tasks**"]

3. code (Before/After comparison)
   - Return a JSON OBJECT with 4 fields:
     - "before_label": short label like "Blocking Code"
     - "before": max 4 lines of code showing the WRONG/naive approach
     - "after_label": short label like "Non-Blocking Code"
     - "after": max 6 lines of code showing the CORRECT approach
   - Use realistic variable names. Highlight the key improvement.
   - NO comments unless truly necessary. Code should be self-explanatory.

4. explanation_2 (How it Works — Timeline)
   - Return a JSON OBJECT with one field:
     - "steps": array of 3-4 short strings describing what happens step-by-step
     - Each step: max 12 words. Plain English. No bullet points inside strings.
   - Example: {"steps": ["Incoming request hits the Event Loop", "Node passes heavy I/O to libuv thread pool", "Main thread continues processing other requests", "Callback fires when I/O completes"]}
   - Last step CAN include a Yes/No branch like: "Is it I/O? Yes → libuv. No → Event Loop."

5. real_world_usecase
   - 2-3 SHORT sentences. Max 40 words total.
   - Describe a real production scenario where this concept saves time or prevents bugs.
   - Keep sentences short. Use **word** for emphasis.

6. common_edge_cases (Gotcha)
   - 2-3 SHORT sentences. Max 40 words total.
   - Describe the #1 mistake developers make with this concept.
   - Start with a clear warning. Use **word** for emphasis.

7. interview_question
   - ONE question (string). Should test deep understanding, not just syntax.
   - Format: "What exactly happens when you call ${topic}?" or similar probing question.
   - Max 20 words.

8. pro_tip
   - ONE crisp sentence. Max 20 words. A professional best practice.
   - Use **word** for emphasis.

9. difficulty
   - Must be exactly one of: "Beginner", "Intermediate", "Advanced"

GOLDEN RULES:
- Every field must be beginner-friendly. No jargon without explanation.
- Short sentences win over long sentences.
- Code must be realistic — show actual patterns developers use daily.
- Avoid generic advice. Give specific, actionable insights.

Respond ONLY with valid raw JSON.
Do NOT include markdown, code fences, comments, or extra text.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text?.trim() || '{}';
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const parsed = JSON.parse(text);
    return parsed;
  } catch (err: any) {
    logger.error(`Failed to generate content for "${topic}" with key ${currentKeyIndex}:`, err.message);
    if (retries < apiKeys.length - 1) {
      rotateApiKey();
      return generateTopicContent(moduleName, topic, nextTopic, retries + 1);
    }
    return null;
  }
}

async function seedDatabase() {
  const db = await getDb();
  let day = 1;

  for (const mod of modules) {
    for (const topic of mod.topics) {
      const topicIndex = allTopics.indexOf(topic);
      const nextTopic = allTopics[topicIndex + 1] || 'Cluster Module';

      const exists = await db.get(
        'SELECT id FROM posts WHERE series = ? AND day = ?',
        ['node-mastery', day]
      );
      if (exists) {
        logger.info(`Day ${day} already exists, skipping.`);
        day++;
        continue;
      }

      logger.info(`Generating Node Mastery Day ${day}: ${topic}...`);
      const content = await generateTopicContent(mod.name, topic, nextTopic);

      if (content) {
        const codeStr = typeof content.code === 'object'
          ? JSON.stringify(content.code)
          : content.code || '{}';

        const e1Str = Array.isArray(content.explanation_1)
          ? JSON.stringify(content.explanation_1)
          : content.explanation_1 || '[]';

        const e2Str = typeof content.explanation_2 === 'object'
          ? JSON.stringify(content.explanation_2)
          : content.explanation_2 || '{}';

        await db.run(
          `INSERT INTO posts
          (series, day, title, difficulty, code, question, answer, explanation, hook_text,
           explanation_1, explanation_2, pro_tip, module_name, real_world_usecase,
           common_edge_cases, interview_question)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'node-mastery',
            day,
            topic,
            content.difficulty || 'Intermediate',
            codeStr,
            nextTopic,
            '',
            '',
            content.hook_text || '',
            e1Str,
            e2Str,
            content.pro_tip || '',
            mod.name,
            content.real_world_usecase || '',
            content.common_edge_cases || '',
            content.interview_question || '',
          ]
        );
        logger.info(`✅ Saved Node Mastery Day ${day}: ${topic}`);
        
        logger.info(`Done generating today's post. Exiting so the cron can publish it.`);
        return;
      } else {
        logger.warn(`⚠️  Skipped Day ${day}: ${topic} (generation failed)`);
      }

      day++;
    }
  }

  logger.info('✅ Node Mastery dataset generation complete!');
}

seedDatabase().catch(err => logger.error(err));
