import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { title, description, tags, heroImage, badge, content } = data;

    if (!title || !description || !content) {
      return new Response(JSON.stringify({ message: 'Title, description, and content are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create frontmatter
    const frontmatter = [
      '---',
      `title: "${title}"`,
      `description: "${description}"`,
      `pubDate: "${new Date().toISOString().split('T')[0]}"`,
      heroImage ? `heroImage: "${heroImage}"` : '',
      badge ? `badge: "${badge}"` : '',
      tags && tags.length > 0 ? `tags: [${tags.map((tag: string) => `"${tag}"`).join(', ')}]` : '',
      '---',
      ''
    ].filter(Boolean).join('\n');

    const fileContent = frontmatter + content;
    const filePath = path.join(process.cwd(), 'src', 'content', 'blog', `${slug}.md`);

    // Check if file already exists
    try {
      await fs.access(filePath);
      return new Response(JSON.stringify({ message: 'Article with this slug already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      // File doesn't exist, which is what we want
    }

    await fs.writeFile(filePath, fileContent);

    return new Response(JSON.stringify({ message: 'Article created successfully', slug }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};