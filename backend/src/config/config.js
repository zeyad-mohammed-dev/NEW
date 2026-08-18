//========================================== Environment Configuration ==========================================
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env') });

export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT ?? 3456;
export const DB_URI = process.env.DB_URI;
