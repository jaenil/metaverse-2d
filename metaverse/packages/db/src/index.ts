import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DIRECT_URL! });
const adapter = new PrismaPg(pool);
const client = new PrismaClient({ adapter });

export default client;
