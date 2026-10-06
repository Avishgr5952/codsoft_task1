import fs from 'fs';
import path from 'path';
import net from 'net';
import { spawn } from 'child_process';
import EmbeddedPostgres from 'embedded-postgres';
import { PrismaClient } from '@prisma/client';

function isPortInUse(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  const root = process.cwd();

  // 1. Ensure .env exists
  const envPath = path.join(root, '.env');
  const envExamplePath = path.join(root, '.env.example');
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('[EduManage] Initializing .env from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
  }

  // 2. Ensure PostgreSQL is up
  const pgRunning = await isPortInUse(5432);
  if (!pgRunning) {
    console.log('[EduManage] Starting local embedded PostgreSQL server on port 5432...');
    const dbDir = path.join(root, 'data', 'db');
    const pg = new EmbeddedPostgres({
      databaseDir: dbDir,
      port: 5432,
      user: 'postgres',
      password: 'password',
      persistent: true,
    });
    try {
      await pg.initialise();
    } catch {
      // already initialized
    }
    await pg.start();
    try {
      await pg.createDatabase('edumanage');
    } catch {
      // already exists
    }
    console.log('[EduManage] PostgreSQL is running on port 5432.');
  } else {
    console.log('[EduManage] PostgreSQL is already active on port 5432.');
  }

  // 3. Check database seeding
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log('[EduManage] Empty database detected. Auto-seeding initial demo data...');
      const seedScript = spawn('npx.cmd', ['tsx', 'prisma/seed.ts'], { stdio: 'inherit', shell: true });
      await new Promise((resolve) => seedScript.on('close', resolve));
    } else {
      console.log(`[EduManage] Database ready with ${count} users.`);
    }
  } catch (err: any) {
    console.warn('[EduManage] Running prisma db push to synchronize schema...');
    const pushCmd = spawn('npx.cmd', ['prisma', 'db', 'push', '--skip-generate'], { stdio: 'inherit', shell: true });
    await new Promise((resolve) => pushCmd.on('close', resolve));
    const seedCmd = spawn('npx.cmd', ['tsx', 'prisma/seed.ts'], { stdio: 'inherit', shell: true });
    await new Promise((resolve) => seedCmd.on('close', resolve));
  } finally {
    await prisma.$disconnect();
  }

  // 4. Start Next.js dev server
  console.log('[EduManage] Launching Next.js development server...');
  const nextDev = spawn('npx.cmd', ['next', 'dev'], { stdio: 'inherit', shell: true });

  nextDev.on('close', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error('[EduManage] Startup error:', err);
  process.exit(1);
});
