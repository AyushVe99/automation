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
// MongoDB Mastery Curriculum
// ============================================================
const modules = [
  {
    name: '1. MongoDB Fundamentals',
    topics: [
      'What is MongoDB?',
      'Why MongoDB?',
      'SQL vs NoSQL',
      'JSON vs BSON',
      'Collections & Documents',
      'ObjectId Structure (12-byte breakdown)',
      'Data Types (including UUID, Decimal128)',
      'MongoDB Atlas vs Self-Managed',
      'MongoDB Compass & mongosh',
      'Connecting & Authentication Basics',
    ],
  },
  {
    name: '2. CRUD Operations',
    topics: [
      'Insert One/Many (Ordered vs Unordered)',
      'Find One/Many & Cursors',
      'Projection & Sorting',
      'Limit, Skip & Pagination',
      'Comparison, Logical, Element Operators',
      'Evaluation Operators ($regex, $where)',
      'Update One/Many & Replace',
      'Upsert Operations',
      'Delete One/Many',
      'Array Update Operators ($push, $addToSet, $pull)',
      'Bulk Write Operations',
    ],
  },
  {
    name: '3. Advanced Querying',
    topics: [
      'Filtering Nested Documents & Arrays',
      'Regular Expressions Optimization',
      'Distinct & Count Documents',
      'Bitwise Operators',
      'Geospatial Queries (2dsphere, near, within)',
      'Text Search & Stemming',
      'Cursor Management & Batch Sizes',
      'Read Concern & Write Concern',
    ],
  },
  {
    name: '4. Indexing Strategies',
    topics: [
      'Index Internals (B-Tree)',
      'Single Field & Compound Indexes',
      'Index Key Order & Prefix Rules',
      'Multikey Indexes (Array Limitations)',
      'Unique, Sparse & Partial Indexes',
      'TTL Indexes (Expiration)',
      'Text & Hashed Indexes',
      'Covered Queries',
      'Index Intersection',
      'Hidden Indexes (Testing)',
      'Explain Plan (executionStats)',
      'Index Best Practices & Anti-Patterns',
    ],
  },
  {
    name: '5. Aggregation Framework',
    topics: [
      'Pipeline Architecture & Memory Limits',
      '$match, $project, $group, $sort',
      '$lookup (Unwind & Pipeline joins)',
      '$unwind, $facet, $bucket',
      '$addFields, $set, $unset',
      '$merge & $out (ETL Patterns)',
      '$scoreFusion (Hybrid Search)',
      '$percentile & $median (Statistical)',
      '$currentDate & $currentOp',
      'Aggregation Performance & Spilling',
    ],
  },
  {
    name: '6. Schema Design Patterns',
    topics: [
      'Embedding vs Referencing (Decision Matrix)',
      'One-to-One, One-to-Many, Many-to-Many',
      'Schema Validation (JSON Schema)',
      'Denormalization Strategies',
      'Bucket Pattern (Time Series)',
      'Subset Pattern (Large Arrays)',
      'Polymorphic Pattern',
      'Computed Pattern (Pre-calculation)',
      'Handling Large Arrays & 16MB Limit',
      'Schema Versioning',
    ],
  },
  {
    name: '7. Transactions & Consistency',
    topics: [
      'ACID Properties in MongoDB',
      'Multi-Document Transactions (Replica Sets & Sharded)',
      'Session Management',
      'Read Concern (local, majority, linearizable)',
      'Write Concern (w:1, w:majority, w:0)',
      'Retryable Writes & Idempotency',
      'Snapshot Isolation',
      'Transaction Overhead & Best Practices',
    ],
  },
  {
    name: '8. Replication & High Availability',
    topics: [
      'Replica Set Architecture (Primary, Secondary, Arbiter)',
      'Oplog & Replication Lag',
      'Automatic Failover & Elections',
      'Read Preferences (primary, secondary, nearest)',
      'Write Concern & Durability',
      'Hidden & Delayed Members',
      'Backup & Restore (mongodump, snapshots)',
      'Point-in-Time Recovery',
    ],
  },
  {
    name: '9. Sharding & Horizontal Scaling',
    topics: [
      'Sharding Architecture (mongos, config, shards)',
      'Shard Key Selection (Cardinality, Frequency, Spread)',
      'Hashed vs Ranged Sharding',
      'Chunk Splitting & Migration',
      'Jumbo Chunks & Hotspots',
      'Resharding (Online & Same-Key)',
      'Scatter-Gather Queries',
      'Zone Sharding (Data Locality)',
      'Orphan Cleanup & Metadata Consistency',
    ],
  },
  {
    name: '10. Performance Optimization & Observability',
    topics: [
      'Slow Query Analysis (Profiler)',
      'db.currentOp() & Lock Analysis',
      'WiredTiger Cache & Memory Management',
      'Page Faults & Disk I/O',
      'Query Governance (maxTimeMS, Rejecting Shapes)',
      'Express Path (MongoDB 8.0+)',
      'Disk Spilling Metrics (MongoDB 8.2+)',
      'Delinquent Ticket Metrics',
      'Atlas Performance Advisor',
      'Network Timing & TLS Handshake Metrics',
    ],
  },
  {
    name: '11. Security & Governance',
    topics: [
      'Authentication (SCRAM, LDAP, Kerberos, OIDC)',
      'Authorization & RBAC (Custom Roles)',
      'Encryption at Rest (WiredTiger, Filesystem)',
      'Encryption in Transit (TLS/SSL)',
      'Queryable Encryption (Range, Prefix, Substring)',
      'Field-Level Encryption',
      'Auditing (System Events, DDL/DML)',
      'IP Access Lists & VPC Peering',
      'Security Compliance (SOC2, HIPAA)',
    ],
  },
  {
    name: '12. Advanced Features & AI',
    topics: [
      'Change Streams (Real-time Data)',
      'Time Series Collections (Compression, Granularity)',
      'Vector Search (HNSW, Flat Indexes)',
      'Automated Embeddings (Voyage AI)',
      'Hybrid Search ($scoreFusion)',
      'Atlas Search (Lucene-based)',
      'GridFS (Large Files)',
      'Capped Collections',
      'Views & Online Archive',
      'Ingress Rate Limiting (MongoDB 8.2+)',
    ],
  },
  {
    name: '13. MongoDB with Node.js (Mongoose)',
    topics: [
      'Native Driver vs ODM',
      'Mongoose Schemas & Models',
      'Validation & Middleware (Hooks)',
      'Virtuals & Transformations',
      'Populate vs $lookup',
      'Lean Queries (Performance)',
      'Transactions in Mongoose',
      'Connection Pooling & Error Handling',
      'Index Management in Code',
      'Best Practices for Production',
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
        ['mongo-mastery', day]
      );
      if (exists) {
        logger.info(`Day ${day} already exists, skipping.`);
        day++;
        continue;
      }

      logger.info(`Generating MongoDB Mastery Day ${day}: ${topic}...`);
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
            'mongo-mastery',
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
        logger.info(`✅ Saved MongoDB Mastery Day ${day}: ${topic}`);
        
        logger.info(`Done generating today's post. Exiting so the cron can publish it.`);
        return;
      } else {
        logger.warn(`⚠️  Skipped Day ${day}: ${topic} (generation failed)`);
      }

      day++;
    }
  }

  logger.info('✅ MongoDB Mastery dataset generation complete!');
}

seedDatabase().catch(err => logger.error(err));
