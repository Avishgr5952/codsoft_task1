import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';

async function startDatabase() {
  const dbDir = path.join(process.cwd(), 'data', 'db');
  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    port: 5432,
    user: 'postgres',
    password: 'password',
    persistent: true,
  });

  try {
    await pg.initialise();
  } catch (err: any) {
    // Already initialized or directory exists
  }

  await pg.start();
  console.log('Official Embedded PostgreSQL Server is now running on 127.0.0.1:5432');

  try {
    await pg.createDatabase('edumanage');
    console.log('Created database "edumanage"');
  } catch (e) {
    // Database already exists
  }

  console.log('Ready for connections: postgresql://postgres:password@127.0.0.1:5432/edumanage?schema=public');
}

startDatabase().catch(console.error);
