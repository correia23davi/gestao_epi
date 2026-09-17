import { Redis } from "@upstash/redis";
import fs from "node:fs";
import path from "node:path";

const hasRedisCreds =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedisCreds
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const LOCAL_DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "gestao-epi-db.json")
  : path.join(process.cwd(), ".data", "db.local.json");

let warned = false;
function warnNoRedisIfNeeded() {
  if (redis || warned) return;
  warned = true;
  console.warn(
    "[gestao-epi] UPSTASH_REDIS_REST_URL/TOKEN não configurados — usando " +
      `armazenamento local em "${LOCAL_DB_PATH}". Configure a integração ` +
      "Upstash Redis na Vercel para persistir os dados em produção."
  );
}

function readLocalFile() {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, "utf8"));
  } catch {
    return {};
  }
}

function writeLocalFile(data) {
  fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function dbGet(key) {
  if (redis) return redis.get(key);
  warnNoRedisIfNeeded();
  const data = readLocalFile();
  return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
}

export async function dbSet(key, value) {
  if (redis) {
    await redis.set(key, value);
    return;
  }
  warnNoRedisIfNeeded();
  const data = readLocalFile();
  data[key] = value;
  writeLocalFile(data);
}

export async function dbDel(key) {
  if (redis) {
    await redis.del(key);
    return;
  }
  warnNoRedisIfNeeded();
  const data = readLocalFile();
  delete data[key];
  writeLocalFile(data);
}

export function isUsingRedis() {
  return !!redis;
}
