import { getDb } from '../db/index.js';

export interface Post {
  id: number;
  series: string;
  day: number;
  title: string;
  difficulty: string;
  code: string;
  question: string;
  answer: string;
  explanation: string;
  caption: string | null;
  hashtags: string | null;
  published: number;
  published_at: string | null;
  instagram_post_id: string | null;
  brute_force_code?: string;
  optimal_code?: string;
  example_input?: string;
  example_output?: string;
  hook_text?: string;
  explanation_1?: string;
  explanation_2?: string;
  pro_tip?: string;
  module_name?: string;
}

export class PostRepository {
  async getPostsBySeries(series: string): Promise<Post[]> {
    const db = await getDb();
    return db.all<Post[]>('SELECT * FROM posts WHERE series = ? ORDER BY day ASC', [series]);
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const db = await getDb();
    return db.get<Post>('SELECT * FROM posts WHERE id = ?', [id]);
  }

  async getNextUnpublishedPost(series: string): Promise<Post | undefined> {
    const db = await getDb();
    return db.get<Post>('SELECT * FROM posts WHERE series = ? AND published = 0 ORDER BY day ASC LIMIT 1', [series]);
  }

  async markPostAsPublished(id: number, igPostId: string, caption: string): Promise<void> {
    const db = await getDb();
    await db.run(
      'UPDATE posts SET published = 1, published_at = datetime("now"), instagram_post_id = ?, caption = ? WHERE id = ?',
      [igPostId, caption, id]
    );
  }
}

export const postRepository = new PostRepository();
