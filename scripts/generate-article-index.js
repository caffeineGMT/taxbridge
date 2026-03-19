const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../data/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.json') && f !== 'articles-index.json');

const articles = files.map(file => {
  const data = JSON.parse(fs.readFileSync(path.join(blogDir, file), 'utf8'));
  return {
    slug: data.slug,
    title: data.title,
    description: data.description,
    category: data.category,
    publishedAt: data.publishedAt,
    readingTime: data.readingTime || 10,
    featured: data.featured || false
  };
}).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

fs.writeFileSync(
  path.join(blogDir, 'articles-index.json'),
  JSON.stringify(articles, null, 2)
);

console.log('✅ articles-index.json updated with', articles.length, 'articles');
console.log('Latest articles:');
articles.slice(0, 5).forEach(a => console.log(' -', a.title));
