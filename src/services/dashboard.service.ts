import { postRepository, Post } from '../repositories/post.repository.js';
import { env } from '../config/env.js';

export interface DashboardData {
  series: string;
  totalDays: number;
  publishedCount: number;
  remainingCount: number;
  posts: Post[];
}

export class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    const series = env.SERIES;
    const posts = await postRepository.getPostsBySeries(series);
    
    const publishedCount = posts.filter(p => p.published).length;
    const remainingCount = posts.length - publishedCount;

    return {
      series,
      totalDays: posts.length,
      publishedCount,
      remainingCount,
      posts
    };
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return postRepository.getPostById(id);
  }
}

export const dashboardService = new DashboardService();
