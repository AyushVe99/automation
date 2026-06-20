import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).default(3000),
  SERIES: z.string().default('javascript'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_API_KEY_2: z.string().optional(),
  USE_GEMINI: z.string().optional().default('true'),
  IG_USER_ID: z.string().optional(),
  IG_ACCESS_TOKEN: z.string().optional(),
  DRY_RUN: z.string().optional().default('false'),
});

export const env = envSchema.parse(process.env);
