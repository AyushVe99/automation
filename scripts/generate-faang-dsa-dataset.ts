import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../src/db/index.js';
import { GoogleGenAI } from '@google/genai';
import { env } from '../src/config/env.js';
import { logger } from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = env.GEMINI_API_KEY_3;
if (!apiKey) {
  logger.error('No GEMINI_API_KEY_3 provided in environment variables.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const modules = [
  {
    name: "1. DSA Foundations & Complexity Analysis",
    topics: [
      "What is DSA & Why FAANG Cares",
      "Time Complexity (Big O, Big Theta, Big Omega)",
      "Space Complexity",
      "Best, Average & Worst Cases",
      "Recursion Fundamentals",
      "Call Stack Visualization",
      "Mathematical Analysis of Algorithms"
    ]
  },
  {
    name: "2. Arrays Mastery",
    topics: [
      "Array Fundamentals",
      "Insertion, Deletion & Traversal",
      "Prefix Sum",
      "Difference Array",
      "Kadane's Algorithm",
      "Dutch National Flag Algorithm",
      "Array Rotation Techniques",
      "FAANG Array Problems"
    ]
  },
  {
    name: "3. Strings Mastery",
    topics: [
      "String Basics",
      "Character Frequency Techniques",
      "Palindrome Problems",
      "String Matching Basics",
      "Rabin-Karp",
      "KMP Algorithm",
      "Z Algorithm",
      "Rolling Hash"
    ]
  },
  {
    name: "4. Searching Algorithms",
    topics: [
      "Linear Search",
      "Binary Search Fundamentals",
      "Binary Search on Answer",
      "Lower Bound & Upper Bound",
      "Search in Rotated Array",
      "Peak Element Problems",
      "FAANG Binary Search Patterns"
    ]
  },
  {
    name: "5. Sorting Algorithms",
    topics: [
      "Bubble Sort",
      "Selection Sort",
      "Insertion Sort",
      "Merge Sort",
      "Quick Sort",
      "Heap Sort",
      "Counting Sort",
      "Radix Sort",
      "Sorting Complexity Analysis"
    ]
  },
  {
    name: "6. Hashing & Hash Maps",
    topics: [
      "Hash Functions",
      "Hash Tables",
      "Collision Handling",
      "Frequency Counting",
      "Two Sum Pattern",
      "Anagram Problems",
      "Set vs Map"
    ]
  },
  {
    name: "7. Two Pointers Pattern",
    topics: [
      "Opposite Direction Pointers",
      "Same Direction Pointers",
      "Pair Sum Problems",
      "Container With Most Water",
      "3Sum",
      "Trapping Rain Water"
    ]
  },
  {
    name: "8. Sliding Window Pattern",
    topics: [
      "Fixed Window",
      "Variable Window",
      "Longest Substring Problems",
      "Maximum Sum Subarray",
      "Character Replacement",
      "Advanced Sliding Window"
    ]
  },
  {
    name: "9. Linked Lists",
    topics: [
      "Singly Linked List",
      "Doubly Linked List",
      "Circular Linked List",
      "Reverse Linked List",
      "Fast & Slow Pointer",
      "Merge Lists",
      "LRU Cache Concept"
    ]
  },
  {
    name: "10. Stacks",
    topics: [
      "Stack Fundamentals",
      "Monotonic Stack",
      "Next Greater Element",
      "Daily Temperatures",
      "Largest Rectangle in Histogram",
      "Expression Evaluation"
    ]
  },
  {
    name: "11. Queues & Deques",
    topics: [
      "Queue Fundamentals",
      "Circular Queue",
      "Deque",
      "Monotonic Queue",
      "Sliding Window Maximum",
      "BFS Foundation"
    ]
  },
  {
    name: "12. Heaps & Priority Queues",
    topics: [
      "Min Heap",
      "Max Heap",
      "Heapify",
      "Top K Elements",
      "Kth Largest Element",
      "Merge K Sorted Lists",
      "Median Finder"
    ]
  },
  {
    name: "13. Trees Fundamentals",
    topics: [
      "Binary Trees",
      "DFS Traversals",
      "BFS Traversals",
      "Tree Height & Depth",
      "Diameter of Tree",
      "Balanced Trees"
    ]
  },
  {
    name: "14. Binary Search Trees",
    topics: [
      "BST Properties",
      "Insert/Delete/Search",
      "Validate BST",
      "Lowest Common Ancestor",
      "Kth Smallest Element",
      "BST Iterators"
    ]
  },
  {
    name: "15. Advanced Trees",
    topics: [
      "AVL Trees",
      "Red Black Trees",
      "Segment Trees",
      "Fenwick Trees",
      "Interval Trees",
      "Range Query Problems"
    ]
  },
  {
    name: "16. Tries",
    topics: [
      "Trie Fundamentals",
      "Insert & Search",
      "Prefix Matching",
      "Word Dictionary",
      "Autocomplete Systems",
      "Bitwise Trie"
    ]
  },
  {
    name: "17. Graph Fundamentals",
    topics: [
      "Graph Representation",
      "Adjacency List",
      "Adjacency Matrix",
      "Connected Components",
      "Graph Traversal Basics"
    ]
  },
  {
    name: "18. Graph Traversal",
    topics: [
      "Breadth First Search",
      "Depth First Search",
      "Flood Fill",
      "Number of Islands",
      "Cycle Detection",
      "Bipartite Graph"
    ]
  },
  {
    name: "19. Topological Sorting",
    topics: [
      "Kahn's Algorithm",
      "DFS Topological Sort",
      "Course Schedule",
      "Dependency Graph Problems"
    ]
  },
  {
    name: "20. Shortest Path Algorithms",
    topics: [
      "Dijkstra Algorithm",
      "Bellman Ford",
      "Floyd Warshall",
      "0-1 BFS",
      "Network Delay Time"
    ]
  },
  {
    name: "21. Minimum Spanning Trees",
    topics: [
      "Union Find",
      "Disjoint Set Union",
      "Kruskal Algorithm",
      "Prim Algorithm"
    ]
  },
  {
    name: "22. Backtracking",
    topics: [
      "Recursion Trees",
      "Subsets",
      "Permutations",
      "Combination Sum",
      "N Queens",
      "Sudoku Solver"
    ]
  },
  {
    name: "23. Greedy Algorithms",
    topics: [
      "Greedy Strategy",
      "Interval Scheduling",
      "Jump Game",
      "Merge Intervals",
      "Activity Selection"
    ]
  },
  {
    name: "24. Dynamic Programming Fundamentals",
    topics: [
      "Memoization",
      "Tabulation",
      "State Design",
      "1D DP",
      "2D DP",
      "Space Optimization"
    ]
  },
  {
    name: "25. Advanced Dynamic Programming",
    topics: [
      "Knapsack",
      "LCS",
      "LIS",
      "Matrix DP",
      "Bitmask DP",
      "Digit DP",
      "Tree DP"
    ]
  },
  {
    name: "26. Bit Manipulation",
    topics: [
      "Bitwise Operators",
      "Power of Two",
      "Bit Masking",
      "XOR Tricks",
      "Subset Generation",
      "Advanced Bit Problems"
    ]
  },
  {
    name: "27. Advanced Interview Patterns",
    topics: [
      "Meet in the Middle",
      "Sweep Line",
      "Monotonic Structures",
      "Union Find Pattern",
      "Graph Patterns",
      "DP Pattern Recognition"
    ]
  },
  {
    name: "28. FAANG Mock Interview Preparation",
    topics: [
      "Problem Solving Framework",
      "Brute Force → Optimal Thinking",
      "Communication in Interviews",
      "Complexity Analysis",
      "Top 100 FAANG Problems",
      "Mock Interview Walkthroughs"
    ]
  }
];

async function generateTopicContent(moduleName: string, topic: string): Promise<any> {
    const prompt = `
You are a top-tier FAANG Staff Engineer creating content for a highly respected DSA Interview Prep Course.

Module: ${moduleName}
Topic: ${topic}

Analyze the topic name. If it is a fundamental concept or a pattern blueprint (e.g., "Prefix Sum", "Monotonic Stack", "Hash Tables"), teach the concept and provide the generic code template.
If it is a classic problem (e.g., "Two Sum Pattern", "Container With Most Water", "Course Schedule"), walk through the optimal solution and explain how the pattern applies.

Generate a JSON object with exactly these fields:
{
  "hook_text": string,
  "code": string,
  "explanation_1": string,
  "explanation_2": array of strings,
  "real_world_usecase": string,
  "common_edge_cases": string,
  "interview_question": string,
  "pro_tip": string,
  "difficulty": string
}

Requirements:
1. hook_text: 1 short sentence engaging hook on why this matters in FAANG.
2. code: Modern, clean JavaScript. If a concept, provide the Blueprint Template. If a problem, provide optimal solution. Max 15 lines. No markdown around it.
3. explanation_1: The Intuition. Break down the logic simply. Format as HTML bullet points (<ul><li>...</li></ul>). Max 3 short bullets. Use <strong> for emphasis.
4. explanation_2: The Step-by-Step Mechanics. How does it execute? Provide a JSON array of strings. Each string is ONE specific execution step. Provide 3 to 6 steps. Max 1 sentence per step.
5. real_world_usecase: Where does FAANG use this? STRICTLY max 2 short sentences.
6. common_edge_cases: What breaks this code? Format as HTML bullet points (<ul><li>...</li></ul>). Max 2 bullets.
7. interview_question: A quick theoretical follow-up question.
8. pro_tip: A secret trick for recognizing this pattern. STRICTLY max 1 short sentence.
9. difficulty: "Beginner", "Intermediate", or "Advanced".

Respond ONLY with valid raw JSON. Do not include markdown blocks like \`\`\`json.
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
    
    return JSON.parse(text);
  } catch (err: any) {
    logger.error(`Failed to generate FAANG DSA content for ${topic}: ${err.message}`);
    // Wait a bit before returning null to back off
    await new Promise(r => setTimeout(r, 5000));
    return null;
  }
}

async function run() {
  const db = await getDb();
  let day = 1;
  
  for (const mod of modules) {
    for (const topic of mod.topics) {
      logger.info(`Generating FAANG DSA content for Day ${day}: ${topic}...`);
      
      const exists = await db.get('SELECT explanation_1, published FROM posts WHERE series = ? AND day = ?', ['faang-dsa', day]);
      if (exists) {
         if (exists.published) {
           logger.info(`Day ${day} is already published, skipping.`);
           day++;
           continue;
         }
         if (exists.explanation_1 && exists.explanation_1.length > 10) {
           logger.info(`Day ${day} already has content, skipping AI generation.`);
           day++;
           continue;
         }
      }

      const content = await generateTopicContent(mod.name, topic);
      
      if (content) {
        await db.run(`
          INSERT INTO posts 
          (series, day, title, difficulty, code, question, answer, explanation, hook_text, explanation_1, explanation_2, pro_tip, module_name, real_world_usecase, common_edge_cases, interview_question)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(series, day) DO UPDATE SET
            title = excluded.title,
            difficulty = excluded.difficulty,
            code = excluded.code,
            question = excluded.question,
            answer = excluded.answer,
            explanation = excluded.explanation,
            hook_text = excluded.hook_text,
            explanation_1 = excluded.explanation_1,
            explanation_2 = excluded.explanation_2,
            pro_tip = excluded.pro_tip,
            module_name = excluded.module_name,
            real_world_usecase = excluded.real_world_usecase,
            common_edge_cases = excluded.common_edge_cases,
            interview_question = excluded.interview_question
        `, [
          'faang-dsa',
          day,
          topic,
          content.difficulty || 'Intermediate',
          content.code || '// No code',
          '', // question unused
          '', // answer unused
          '', // explanation unused
          content.hook_text || '',
          content.explanation_1 || '',
          content.explanation_2 ? JSON.stringify(content.explanation_2) : '[]',
          content.pro_tip || '',
          mod.name,
          content.real_world_usecase || '',
          content.common_edge_cases || '',
          content.interview_question || ''
        ]);
        logger.info(`Successfully saved FAANG DSA Day ${day} (${topic}) to DB.`);
      }
      
      day++;
      // Sleep to avoid rate limits since we are using a single key
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  
  logger.info(`Successfully generated FAANG DSA course!`);
}

run().catch(err => logger.error(err));
