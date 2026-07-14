import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
console.log("[DB INIT] Connected", !!connectionString);
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const client = new PrismaClient({ adapter });

export default client;

