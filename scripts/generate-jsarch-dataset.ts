import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../src/db/index.js';
import { GoogleGenAI } from '@google/genai';
import { env } from '../src/config/env.js';
import { logger } from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKeys = [env.GEMINI_API_KEY, env.GEMINI_API_KEY_2].filter(Boolean) as string[];
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

// The 28 Module Curriculum
const modules = [
  {
    name: "1. JavaScript Fundamentals",
    topics: [
      "What is JavaScript?", "How JS Works in Browser", "Variables (var, let, const)", "Data Types",
      "Type Conversion", "Operators", "Expressions & Statements", "Template Literals", "Comments", "Strict Mode"
    ]
  },
  {
    name: "2. Control Flow",
    topics: [
      "if / else", "switch", "Ternary Operator", "Loops", "for Loop", "while Loop", "do-while",
      "for...in", "for...of", "break & continue"
    ]
  },
  {
    name: "3. Functions",
    topics: [
      "Function Declaration", "Function Expression", "Arrow Functions", "Parameters & Arguments", 
      "Default Parameters", "Rest Parameters", "Return Statement", "Higher Order Functions", "Callback Functions", "IIFE"
    ]
  },
  {
    name: "4. Scope & Execution Context",
    topics: [
      "Global Scope", "Function Scope", "Block Scope", "Lexical Scope", "Hoisting", 
      "Execution Context", "Call Stack", "Temporal Dead Zone"
    ]
  },
  {
    name: "5. Objects",
    topics: [
      "Object Basics", "Creating Objects", "Object Methods", "this Keyword", "Object Destructuring", 
      "Spread Operator", "Object.freeze()", "Object.seal()", "Object.keys()", "Object.values()", "Object.entries()"
    ]
  },
  {
    name: "6. Arrays",
    topics: [
      "Array Basics", "push/pop", "shift/unshift", "splice/slice", "concat", "map", "filter", 
      "reduce", "find", "findIndex", "some", "every", "sort", "flat", "flatMap", "Array Destructuring"
    ]
  },
  {
    name: "7. Strings",
    topics: [
      "String Methods", "split", "join", "trim", "replace", "substring", "includes", "startsWith", "endsWith"
    ]
  },
  {
    name: "8. Numbers & Math",
    topics: [
      "Number Methods", "Math Object", "Random Numbers", "Rounding Methods", "BigInt"
    ]
  },
  {
    name: "9. Date & Time",
    topics: [
      "Date Object", "Timestamps", "Formatting Dates", "Time Zones"
    ]
  },
  {
    name: "10. DOM",
    topics: [
      "DOM Introduction", "Selecting Elements", "Query Selectors", "DOM Traversal", "Creating Elements", 
      "Updating Elements", "Removing Elements", "Class Manipulation", "Attributes", "Dataset API"
    ]
  },
  {
    name: "11. Events",
    topics: [
      "Event Basics", "Click Events", "Keyboard Events", "Mouse Events", "Form Events", "Event Object", 
      "Event Bubbling", "Event Capturing", "Event Delegation", "Custom Events"
    ]
  },
  {
    name: "12. Browser APIs",
    topics: [
      "Local Storage", "Session Storage", "Cookies", "Clipboard API", "Geolocation API", "History API", "Web APIs Overview"
    ]
  },
  {
    name: "13. ES6+",
    topics: [
      "let vs const", "Arrow Functions", "Destructuring", "Spread Operator", "Rest Operator", 
      "Modules", "Import/Export", "Optional Chaining", "Nullish Coalescing", "Symbols"
    ]
  },
  {
    name: "14. Asynchronous JavaScript",
    topics: [
      "Synchronous vs Async", "Callbacks", "Callback Hell", "Promises", "Promise Chaining", "Promise Methods", 
      "async/await", "Event Loop", "Microtasks", "Macrotasks"
    ]
  },
  {
    name: "15. Fetch & APIs",
    topics: [
      "HTTP Basics", "REST APIs", "Fetch API", "GET Request", "POST Request", "PUT Request", 
      "DELETE Request", "Headers", "Error Handling", "API Authentication"
    ]
  },
  {
    name: "16. Advanced Functions",
    topics: [
      "Closures", "Currying", "Function Composition", "Memoization", "Debouncing", "Throttling", 
      "Pure Functions", "Functional Programming"
    ]
  },
  {
    name: "17. OOP",
    topics: [
      "Constructor Functions", "Prototypes", "Prototype Chain", "Classes", "Inheritance", 
      "Encapsulation", "Polymorphism", "Abstraction", "Static Methods"
    ]
  },
  {
    name: "18. Advanced JavaScript",
    topics: [
      "Call Method", "Apply Method", "Bind Method", "this Deep Dive", "Garbage Collection", 
      "Memory Leaks", "WeakMap", "WeakSet", "Symbol", "Iterators", "Generators"
    ]
  },
  {
    name: "19. Modern JS Data Structures",
    topics: [
      "Map", "Set", "WeakMap", "WeakSet"
    ]
  },
  {
    name: "20. Error Handling",
    topics: [
      "try/catch", "throw", "Custom Errors", "Error Boundaries Concept"
    ]
  },
  {
    name: "21. Modules",
    topics: [
      "ES Modules", "CommonJS", "Dynamic Imports"
    ]
  },
  {
    name: "22. Performance",
    topics: [
      "Event Loop Deep Dive", "Rendering Process", "Reflow & Repaint", "Lazy Loading", 
      "Code Splitting", "Tree Shaking"
    ]
  },
  {
    name: "23. Advanced Browser Concepts",
    topics: [
      "Web Workers", "Service Workers", "Caching", "IndexedDB", "WebSockets"
    ]
  },
  {
    name: "24. Design Patterns",
    topics: [
      "Module Pattern", "Singleton Pattern", "Factory Pattern", "Observer Pattern", "Pub/Sub Pattern"
    ]
  },
  {
    name: "25. JavaScript Internals",
    topics: [
      "V8 Engine", "JS Compilation", "JIT Compilation", "Memory Management", "Garbage Collection Internals"
    ]
  },
  {
    name: "26. Interview Preparation",
    topics: [
      "Hoisting Interview Questions", "Closures Interview Questions", "Event Loop Interview Questions", 
      "Promise Interview Questions", "this Keyword Questions", "Prototype Questions", "Output-Based Questions", 
      "Machine Coding Problems",
      "Implement a Deep Clone Function", "Implement Promise.all()", "Implement a Debounce Function",
      "Implement a Throttle Function", "Flatten a Nested Array", "Implement an Event Emitter",
      "Implement Function.prototype.bind", "Implement Array.prototype.reduce", "Currying implementation", "Implement a basic LRU Cache"
    ]
  },
  {
    name: "27. Real-World Topics",
    topics: [
      "Infinite Scroll", "Search Autocomplete", "Drag & Drop", "File Upload", "Pagination", 
      "Authentication Flow", "JWT Basics", "Rate Limiting", "Retry Mechanism", "Optimistic Updates"
    ]
  },
  {
    name: "28. Expert Level",
    topics: [
      "Event Loop Internals", "JavaScript Runtime", "Browser Architecture", "Memory Profiling", 
      "Performance Profiling", "AST (Abstract Syntax Tree)", "Babel", "Polyfills", "Transpilers", 
      "Compilers", "Virtual DOM Concept", "Building Your Own Promise"
    ]
  }
];

async function generateTopicContent(moduleName: string, topic: string, retries = 0): Promise<any> {
  const prompt = `
You are a world-class JavaScript educator and architect creating content for a professional learning platform.

Topic: ${topic}
Module: ${moduleName}

Generate a JSON object with exactly these fields:

{
"hook_text": string,
"code": string,
"explanation_1": string,
"explanation_2": {
  "text": string,
  "mermaid_diagram": string
},
"real_world_usecase": string,
"common_edge_cases": string,
"interview_question": string,
"pro_tip": string,
"difficulty": string
}

Requirements:

1. hook_text
* Write an engaging 1-2 sentence hook explaining why this topic matters in real-world JavaScript development.
* Keep it concise, practical, and beginner-friendly.
* Avoid hype, clickbait, or exaggerated claims.

2. code
* Provide a concise, modern JavaScript example demonstrating the core concept.
* Use ES6+ syntax whenever appropriate.
* Use realistic variable names.
* Keep the example under 8 lines.

3. explanation_1
* Explain what the concept is and how developers use it.
* Focus on understanding rather than syntax.
* Keep it to 3-4 sentences.
* Prioritize clarity over implementation details.

4. explanation_2
* "text": Explain important behavior, caveats, limitations, or common mistakes developers should know. Keep it to 3-4 sentences.
* "mermaid_diagram": (Optional) Provide a valid Mermaid.js diagram definition (e.g., flowchart TD, sequenceDiagram, etc.) that visually explains the concept or architecture. Use simple, clean shapes. Do not use markdown fences (like \`\`\`mermaid) inside the string. Return an empty string if a diagram isn't helpful.

5. real_world_usecase
* Explain a realistic, production-level scenario or architecture where this concept is actively used.
* Keep it to 3-4 sentences.

6. common_edge_cases
* Explain a specific hidden gotcha, edge case, or silent bug that happens when developers misuse this concept.
* Keep it to 3-4 sentences.

7. interview_question
* Provide a high-level technical interview question (and brief answer) that tests true understanding of this topic.
* Format it nicely in 3-4 sentences.

8. pro_tip
* Provide a modern best practice or practical recommendation used in professional codebases.
* Avoid outdated micro-optimizations.
* Avoid absolute statements such as "always" or "never" unless universally true.

9. difficulty
* Must be exactly one of:
  * "Beginner"
  * "Intermediate"
  * "Advanced"

General Rules:
* PROGRESSIVE DISCLOSURE: This content must be a 10/10 for BOTH beginners and intermediate developers.
* Start Simple (hook, code, explanation_1): Explain it so clearly that a 1st-year college student (beginner) can understand immediately. Use plain English, simple analogies, and short sentences. Avoid dense academic jargon. Keep paragraphs extremely short (max 3 sentences).
* End Deep (real_world, edge_cases, interview): Provide advanced, high-value insights, deep mechanics, and production-level architecture so intermediate developers learn something new.
* Explain jargon: If you must use advanced terms (like 'interpolation' or 'lexical scope'), explain them briefly.
* Prioritize technical accuracy over sounding advanced.
* Avoid unverified performance claims.
* Avoid mentioning memory usage, CPU optimizations, or engine internals unless directly relevant to the topic.
* Use a consistent professional tone.
* Content should be suitable for a JavaScript learning platform.
* Explanations must be timeless and aligned with modern JavaScript best practices.

Respond ONLY with valid raw JSON.
Do not include markdown, code fences, comments, or additional text.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text?.trim() || '{}';
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err: any) {
    logger.error(`Failed to generate content for ${topic} with key index ${currentKeyIndex}:`, err.message);
    if (retries < apiKeys.length - 1) {
      logger.info('Rotating API key and retrying...');
      rotateApiKey();
      return generateTopicContent(moduleName, topic, retries + 1);
    }
    return null;
  }
}

async function seedDatabase() {
  const db = await getDb();
  let day = 1;

  for (const mod of modules) {
    for (const topic of mod.topics) {
      logger.info(`Generating content for Day ${day}: ${topic}...`);
      
      const exists = await db.get('SELECT id FROM posts WHERE series = ? AND day = ?', ['js-arch', day]);
      if (exists) {
        logger.info(`Day ${day} already exists, skipping.`);
        day++;
        continue;
      }

      const content = await generateTopicContent(mod.name, topic);
      
      if (content) {
        await db.run(
          `INSERT INTO posts 
          (series, day, title, difficulty, code, question, answer, explanation, hook_text, explanation_1, explanation_2, pro_tip, module_name, real_world_usecase, common_edge_cases, interview_question) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'js-arch', 
            day, 
            topic, 
            content.difficulty || 'Beginner', 
            content.code || '// No code', 
            '', // question
            '', // answer
            '', // explanation
            content.hook_text || '',
            content.explanation_1 || '',
            content.explanation_2 ? (typeof content.explanation_2 === 'string' ? content.explanation_2 : JSON.stringify(content.explanation_2)) : '',
            content.pro_tip || '',
            mod.name,
            content.real_world_usecase || '',
            content.common_edge_cases || '',
            content.interview_question || ''
          ]
        );
        logger.info(`Successfully saved Day ${day} to DB.`);
      }
      
      day++;
      // Sleep to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  logger.info('Dataset generation complete.');
}

seedDatabase().catch(err => logger.error(err));
