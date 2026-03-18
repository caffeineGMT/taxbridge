/**
 * Product Hunt API Client
 *
 * Fetches product ranking, upvotes, comments, and traffic data from Product Hunt.
 * Uses Product Hunt GraphQL API v2.
 */

interface ProductHuntProduct {
  id: string;
  name: string;
  tagline: string;
  votesCount: number;
  commentsCount: number;
  ranking: number;
  websiteUrl: string;
  createdAt: string;
  featuredAt: string | null;
}

interface ProductHuntMetrics {
  productId: string;
  timestamp: string;
  ranking: number;
  upvotes: number;
  comments: number;
  websiteClicks: number;
  hoursSinceLaunch: number;
  topComments: {
    author: string;
    body: string;
    createdAt: string;
    votesCount: number;
  }[];
}

interface ProductHuntDailyRanking {
  date: string;
  products: {
    id: string;
    name: string;
    ranking: number;
    votesCount: number;
  }[];
}

export class ProductHuntClient {
  private apiToken: string;
  private apiUrl = 'https://api.producthunt.com/v2/api/graphql';

  constructor(apiToken?: string) {
    this.apiToken = apiToken || process.env.PRODUCT_HUNT_API_TOKEN || '';
  }

  /**
   * Get current product by slug or ID
   */
  async getProduct(slugOrId: string): Promise<ProductHuntProduct | null> {
    const query = `
      query GetProduct($slug: String!) {
        post(slug: $slug) {
          id
          name
          tagline
          votesCount
          commentsCount
          website
          createdAt
          featuredAt
        }
      }
    `;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { slug: slugOrId },
        }),
      });

      if (!response.ok) {
        throw new Error(`Product Hunt API error: ${response.statusText}`);
      }

      const { data } = await response.json();

      if (!data?.post) {
        return null;
      }

      return {
        id: data.post.id,
        name: data.post.name,
        tagline: data.post.tagline,
        votesCount: data.post.votesCount,
        commentsCount: data.post.commentsCount,
        ranking: 0, // Will be calculated from daily rankings
        websiteUrl: data.post.website,
        createdAt: data.post.createdAt,
        featuredAt: data.post.featuredAt,
      };
    } catch (error) {
      console.error('Error fetching product from Product Hunt:', error);
      throw error;
    }
  }

  /**
   * Get today's products (Product of the Day rankings)
   */
  async getTodayProducts(): Promise<ProductHuntDailyRanking> {
    const query = `
      query GetTodayPosts {
        posts(first: 30, order: VOTES) {
          edges {
            node {
              id
              name
              votesCount
              featuredAt
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Product Hunt API error: ${response.statusText}`);
      }

      const { data } = await response.json();

      const products = data.posts.edges
        .filter((edge: any) => {
          // Filter to today's products only
          const featuredAt = new Date(edge.node.featuredAt);
          const today = new Date();
          return featuredAt.toDateString() === today.toDateString();
        })
        .map((edge: any, index: number) => ({
          id: edge.node.id,
          name: edge.node.name,
          ranking: index + 1,
          votesCount: edge.node.votesCount,
        }));

      return {
        date: new Date().toISOString().split('T')[0],
        products,
      };
    } catch (error) {
      console.error('Error fetching today\'s products from Product Hunt:', error);
      throw error;
    }
  }

  /**
   * Get detailed metrics for a product
   */
  async getProductMetrics(productId: string): Promise<ProductHuntMetrics | null> {
    const query = `
      query GetProductDetails($id: ID!) {
        post(id: $id) {
          id
          name
          votesCount
          commentsCount
          createdAt
          comments(first: 5, order: VOTES) {
            edges {
              node {
                body
                createdAt
                votesCount
                user {
                  name
                  username
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { id: productId },
        }),
      });

      if (!response.ok) {
        throw new Error(`Product Hunt API error: ${response.statusText}`);
      }

      const { data } = await response.json();

      if (!data?.post) {
        return null;
      }

      // Get ranking from today's products
      const todayProducts = await this.getTodayProducts();
      const ranking = todayProducts.products.findIndex(p => p.id === productId) + 1;

      // Calculate hours since launch
      const launchTime = new Date(data.post.createdAt);
      const now = new Date();
      const hoursSinceLaunch = Math.floor((now.getTime() - launchTime.getTime()) / (1000 * 60 * 60));

      return {
        productId: data.post.id,
        timestamp: new Date().toISOString(),
        ranking: ranking || 0,
        upvotes: data.post.votesCount,
        comments: data.post.commentsCount,
        websiteClicks: 0, // Not available via public API
        hoursSinceLaunch,
        topComments: data.post.comments.edges.map((edge: any) => ({
          author: edge.node.user.username,
          body: edge.node.body,
          createdAt: edge.node.createdAt,
          votesCount: edge.node.votesCount,
        })),
      };
    } catch (error) {
      console.error('Error fetching product metrics from Product Hunt:', error);
      throw error;
    }
  }

  /**
   * Calculate velocity (upvotes per hour)
   */
  calculateVelocity(metrics: ProductHuntMetrics): number {
    if (metrics.hoursSinceLaunch === 0) return metrics.upvotes;
    return Math.round(metrics.upvotes / metrics.hoursSinceLaunch);
  }

  /**
   * Estimate final ranking based on current velocity
   */
  estimateFinalRanking(metrics: ProductHuntMetrics, todayProducts: ProductHuntDailyRanking): {
    estimated: number;
    confidence: 'low' | 'medium' | 'high';
    projectedUpvotes: number;
  } {
    const velocity = this.calculateVelocity(metrics);
    const hoursRemaining = 24 - metrics.hoursSinceLaunch;
    const projectedUpvotes = metrics.upvotes + (velocity * hoursRemaining);

    // Find estimated ranking
    let estimatedRanking = 1;
    for (const product of todayProducts.products) {
      if (product.id === metrics.productId) continue;
      if (product.votesCount > projectedUpvotes) {
        estimatedRanking++;
      }
    }

    // Calculate confidence based on hours since launch
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (metrics.hoursSinceLaunch >= 12) confidence = 'high';
    else if (metrics.hoursSinceLaunch >= 6) confidence = 'medium';

    return {
      estimated: estimatedRanking,
      confidence,
      projectedUpvotes: Math.round(projectedUpvotes),
    };
  }
}

// Mock client for testing (when API token not available)
export class MockProductHuntClient extends ProductHuntClient {
  private mockRanking = 5;
  private mockUpvotes = 0;
  private startTime = new Date();

  async getProduct(slugOrId: string): Promise<ProductHuntProduct | null> {
    return {
      id: 'mock-product-id',
      name: 'TaxBridge',
      tagline: 'Cross-border tax calculator for H-1B tech workers with RSUs',
      votesCount: this.mockUpvotes,
      commentsCount: Math.floor(this.mockUpvotes * 0.2),
      ranking: this.mockRanking,
      websiteUrl: 'https://taxbridge.com',
      createdAt: this.startTime.toISOString(),
      featuredAt: this.startTime.toISOString(),
    };
  }

  async getTodayProducts(): Promise<ProductHuntDailyRanking> {
    const baseUpvotes = [350, 280, 220, 180, this.mockUpvotes, 120, 100, 85, 70, 60];

    return {
      date: new Date().toISOString().split('T')[0],
      products: baseUpvotes.map((votes, index) => ({
        id: index === 4 ? 'mock-product-id' : `competitor-${index}`,
        name: index === 4 ? 'TaxBridge' : `Competitor ${index + 1}`,
        ranking: index + 1,
        votesCount: votes,
      })).sort((a, b) => b.votesCount - a.votesCount)
        .map((p, i) => ({ ...p, ranking: i + 1 })),
    };
  }

  async getProductMetrics(productId: string): Promise<ProductHuntMetrics | null> {
    const now = new Date();
    const hoursSinceLaunch = Math.floor((now.getTime() - this.startTime.getTime()) / (1000 * 60 * 60));

    // Simulate gradual upvote increase
    this.mockUpvotes = Math.floor(50 + (hoursSinceLaunch * 20) + (Math.random() * 10));

    // Update ranking based on upvotes
    if (this.mockUpvotes > 250) this.mockRanking = 3;
    else if (this.mockUpvotes > 180) this.mockRanking = 5;
    else if (this.mockUpvotes > 120) this.mockRanking = 8;
    else this.mockRanking = 12;

    return {
      productId: 'mock-product-id',
      timestamp: now.toISOString(),
      ranking: this.mockRanking,
      upvotes: this.mockUpvotes,
      comments: Math.floor(this.mockUpvotes * 0.2),
      websiteClicks: Math.floor(this.mockUpvotes * 3.5),
      hoursSinceLaunch,
      topComments: [
        {
          author: 'tech_worker_123',
          body: 'This is exactly what I needed for my cross-border taxes! The FTC optimizer is brilliant.',
          createdAt: new Date(now.getTime() - 3600000).toISOString(),
          votesCount: 12,
        },
        {
          author: 'startup_founder',
          body: 'Great product! How does this compare to hiring a CPA?',
          createdAt: new Date(now.getTime() - 7200000).toISOString(),
          votesCount: 8,
        },
      ],
    };
  }

  // Helper to manually set ranking for testing
  setMockRanking(ranking: number) {
    this.mockRanking = ranking;
  }

  setMockUpvotes(upvotes: number) {
    this.mockUpvotes = upvotes;
  }
}

export function createProductHuntClient(): ProductHuntClient {
  const apiToken = process.env.PRODUCT_HUNT_API_TOKEN;

  if (!apiToken || apiToken === 'your_product_hunt_api_token_here') {
    console.warn('⚠️  Product Hunt API token not found. Using mock client for testing.');
    return new MockProductHuntClient();
  }

  return new ProductHuntClient(apiToken);
}
