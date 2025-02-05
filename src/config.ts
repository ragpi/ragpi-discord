import 'dotenv/config';
import { z } from 'zod';

const ConfigSchema = z.object({
  DISCORD_TOKEN: z.string({
    required_error: 'DISCORD_TOKEN is required',
  }),
  RAGPI_BASE_URL: z.string({
    required_error: 'RAGPI_BASE_URL is required',
  }),
  RAGPI_API_KEY: z.string().nullable().default(null),
  SOURCES: z
    .string()
    .nullable()
    .transform((str) => {
      if (!str) return null;
      return str.split(',').filter(Boolean);
    })
    .default(null),
  CHAT_MODEL: z.string().nullable().default(null),
  DISCORD_CHANNEL_IDS: z
    .string()
    .nullable()
    .transform((str) => {
      if (!str) return null;
      return str.split(',').filter(Boolean);
    })
    .default(null),
  REQUIRE_MENTION: z
    .string()
    .transform((str) => {
      if (!str) return true;
      return ['true', 'True', 'TRUE'].includes(str);
    })
    .default('true'),
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
