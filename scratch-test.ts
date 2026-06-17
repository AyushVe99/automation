import { getDb } from './src/db/index.js';
import { generateImage } from './src/generators/image-generator.js';

async function test() {
  const db = await getDb();
  const post = await db.get('SELECT * FROM posts WHERE series = "dsa" ORDER BY day ASC LIMIT 1');
  if (post) {
    console.log('Generating images for post:', post.title);
    const paths = await generateImage(post);
    console.log('Generated at:', paths);
  } else {
    console.log('No DSA post found.');
  }
}

test().catch(console.error);
