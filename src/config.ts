import 'dotenv/config';
import { z } from 'zod';

const ConfigSchema = z.object({
  DISCORD_TOKEN: z.string({
    required_error: 'DISCORD_TOKEN is required',
  }),
  RAGPI_BASE_URL: z.string({
    required_error: 'RAGPI_BASE_URL is required',
  }),
  DISCORD_CHANNEL_IDS: z
    .string({
      required_error: 'DISCORD_CHANNEL_IDS is required',
    })
    .transform((str) => {
      return str.split(',').filter(Boolean);
    }),
  RAGPI_API_KEY: z.string().optional(),
  RAGPI_SOURCES: z
    .string()
    .optional()
    .transform((str) => {
      if (!str) return [];
      return str.split(',').filter(Boolean);
    }),
  DISCORD_REQUIRE_MENTION: z
    .string()
    .transform((str) => {
      if (!str) return false;
      return ['true', 'True', 'TRUE'].includes(str);
    })
    .default('false'),
  LOG_LEVEL: z
    .string()
    .transform((s) => s.toLowerCase())
    .pipe(z.enum(['error', 'warn', 'info', 'debug']))
    .default('info'),
  NODE_ENV: z.enum(['development', 'production']).default('production'),
});

function validateConfig() {
  try {
    return ConfigSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      throw new Error(`Invalid configuration:\n${issues}`);
    }
    throw error;
  }
}

export const config = validateConfig();
