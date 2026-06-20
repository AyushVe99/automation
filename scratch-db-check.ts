import { getDb } from './src/db/index.js';

async function check() {
  const db = await getDb();
  const count = await db.get('SELECT COUNT(*) as count FROM posts WHERE series="js-arch"');
  console.log('js-arch total:', count);
  
  const unpubCount = await db.get('SELECT COUNT(*) as count FROM posts WHERE series="js-arch" AND published = 0');
  console.log('js-arch unpublished:', unpubCount);
  
  const allCount = await db.all('SELECT series, count(*) as count, sum(published) as published FROM posts GROUP BY series');
  console.log('All series:', allCount);
}

check();
