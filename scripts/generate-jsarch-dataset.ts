import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../src/db/index.js';
import { GoogleGenAI } from '@google/genai';
import { env } from '../src/config/env.js';
import { logger } from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

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
      "Machine Coding Problems"
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

async function generateTopicContent(moduleName: string, topic: string) {
  const prompt = `
You are an expert JavaScript architect creating a masterclass carousel post.
Topic: ${topic}
Module: ${moduleName}

Generate a structured JSON response with the following fields:
- hook_text: A catchy 1-2 sentence hook explaining why this topic matters. (String)
- code: A concise JS code snippet demonstrating the core syntax or concept. (String)
- explanation_1: Deep dive explanation part 1 (e.g. how it works under the hood). Keep it to 2-3 sentences. (String)
- explanation_2: Deep dive explanation part 2 (e.g. common gotchas or memory implications). Keep it to 2-3 sentences. (String)
- pro_tip: A professional tip or best practice regarding this topic. (String)
- difficulty: "Beginner", "Intermediate", or "Advanced". (String)

Respond ONLY with valid JSON. Do not use markdown code blocks (\`\`\`json) around the response, just the raw JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text?.trim() || '{}';
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
    }
    
    return JSON.parse(text);
  } catch (err) {
    logger.error(`Failed to generate content for ${topic}:`, err);
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
          (series, day, title, difficulty, code, question, answer, explanation, hook_text, explanation_1, explanation_2, pro_tip, module_name) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            content.explanation_2 || '',
            content.pro_tip || '',
            mod.name
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
