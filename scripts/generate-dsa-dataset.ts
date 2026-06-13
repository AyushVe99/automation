import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../src/db/index.js';
import { logger } from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 5 High-Quality DSA Questions in JavaScript
const questions = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    question: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    code: "", // we don't strictly need code for question, but can use it to hold signature
    bruteForceCode: "function twoSum(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) {\n        return [i, j];\n      }\n    }\n  }\n  return [];\n}",
    optimalCode: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
    answer: "Optimal approach uses a Hash Map to store values and their indices, allowing O(1) lookups.",
    explanation: "Brute force checks every pair O(n^2). Optimal stores visited elements in a map to find the complement in O(n) time."
  },
  {
    title: "Valid Anagram",
    difficulty: "Easy",
    question: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.",
    code: "",
    bruteForceCode: "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  return s.split('').sort().join('') === t.split('').sort().join('');\n}",
    optimalCode: "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (let char of s) count[char] = (count[char] || 0) + 1;\n  for (let char of t) {\n    if (!count[char]) return false;\n    count[char]--;\n  }\n  return true;\n}",
    answer: "Optimal approach counts character frequencies.",
    explanation: "Sorting takes O(n log n) time. Counting character frequencies in a hash map takes O(n) time and O(1) extra space (since alphabet is fixed)."
  },
  {
    title: "Maximum Subarray",
    difficulty: "Medium",
    question: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    code: "",
    bruteForceCode: "function maxSubArray(nums) {\n  let maxSum = -Infinity;\n  for (let i = 0; i < nums.length; i++) {\n    let currentSum = 0;\n    for (let j = i; j < nums.length; j++) {\n      currentSum += nums[j];\n      maxSum = Math.max(maxSum, currentSum);\n    }\n  }\n  return maxSum;\n}",
    optimalCode: "function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}",
    answer: "Kadane's Algorithm is the optimal O(n) solution.",
    explanation: "Brute force is O(n^2). Kadane's algorithm maintains the maximum subarray sum ending at each index, running in O(n) time."
  },
  {
    title: "Contains Duplicate",
    difficulty: "Easy",
    question: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    code: "",
    bruteForceCode: "function containsDuplicate(nums) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] === nums[j]) return true;\n    }\n  }\n  return false;\n}",
    optimalCode: "function containsDuplicate(nums) {\n  const set = new Set(nums);\n  return set.size !== nums.length;\n}",
    answer: "Use a Set to track seen elements. O(n) time.",
    explanation: "Brute force O(n^2) compares all pairs. Using a HashSet allows O(1) insertions and lookups, making it O(n) overall."
  },
  {
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    question: "You are given an array prices where prices[i] is the price of a given stock on the ith day.\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
    code: "",
    bruteForceCode: "function maxProfit(prices) {\n  let maxP = 0;\n  for (let i = 0; i < prices.length; i++) {\n    for (let j = i + 1; j < prices.length; j++) {\n      maxP = Math.max(maxP, prices[j] - prices[i]);\n    }\n  }\n  return maxP;\n}",
    optimalCode: "function maxProfit(prices) {\n  let minPrice = Infinity;\n  let maxP = 0;\n  for (let price of prices) {\n    if (price < minPrice) {\n      minPrice = price;\n    } else {\n      maxP = Math.max(maxP, price - minPrice);\n    }\n  }\n  return maxP;\n}",
    answer: "Track the minimum price seen so far and calculate potential profit daily.",
    explanation: "Brute force checks all pairs in O(n^2). The optimal solution tracks the lowest valley and the highest peak after it in a single O(n) pass."
  }
];

// Re-assign days properly
let totalQuestions = questions.map((q, index) => {
  return {
    ...q,
    day: index + 1
  };
});

async function run() {
  const db = await getDb();
  
  // Write to JSON file
  const outPath = path.resolve(__dirname, '../data/dsa-150.json');
  fs.writeFileSync(outPath, JSON.stringify(totalQuestions, null, 2));
  logger.info('Saved data/dsa-150.json with 5 questions.');

  // Also insert into database
  for (const q of totalQuestions) {
    const hashtags = JSON.stringify(['dsa', '150daysdsachallenge', 'javascript', 'coding', 'leetcode']);
    try {
      await db.run(
        'INSERT INTO posts (series, day, title, difficulty, code, question, answer, explanation, hashtags, brute_force_code, optimal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['dsa', q.day, q.title, q.difficulty, q.code, q.question, q.answer, q.explanation, hashtags, q.bruteForceCode, q.optimalCode]
      );
    } catch (err: any) {
      if (!err.message.includes('UNIQUE constraint failed')) {
        logger.error('Error inserting row', err);
      } else {
        // Update if already exists
        await db.run(
          'UPDATE posts SET title=?, difficulty=?, question=?, answer=?, explanation=?, brute_force_code=?, optimal_code=? WHERE series=? AND day=?',
          [q.title, q.difficulty, q.question, q.answer, q.explanation, q.bruteForceCode, q.optimalCode, 'dsa', q.day]
        );
      }
    }
  }

  logger.info('Database seeded with 5 DSA questions.');
}

run().catch((err) => logger.error(err));
