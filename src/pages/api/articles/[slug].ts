
import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    const filePath = path.join(process.cwd(), 'src', 'content', 'blog', `${slug}.md`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    return new Response(JSON.stringify({
      ...data,
      content
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Article not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { slug } = params;
    const data = await request.json();
    const { title, description, tags, heroImage, badge, content } = data;
    
    if (!title || !description || !content) {
      return new Response(JSON.stringify({ message: 'Title, description, and content are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filePath = path.join(process.cwd(), 'src', 'content', 'blog', `${slug}.md`);
    
    // Read existing file to preserve pubDate
    const existingContent = await fs.readFile(filePath, 'utf-8');
    const { data: existingData } = matter(existingContent);
    
    // Create updated frontmatter
    const frontmatter = [
      '---',
      `title: "${title}"`,
      `description: "${description}"`,
      `pubDate: "${existingData.pubDate || new Date().toISOString().split('T')[0]}"`,
      `updatedDate: "${new Date().toISOString().split('T')[0]}"`,
      heroImage ? `heroImage: "${heroImage}"` : '',
      badge ? `badge: "${badge}"` : '',
      tags && tags.length > 0 ? `tags: [${tags.map((tag: string) => `"${tag}"`).join(', ')}]` : '',
      '---',
      ''
    ].filter(Boolean).join('\n');

    const fileContent = frontmatter + content;
    
    await fs.writeFile(filePath, fileContent);

    return new Response(JSON.stringify({ message: 'Article updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error updating article' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    const filePath = path.join(process.cwd(), 'src', 'content', 'blog', `${slug}.md`);
    
    await fs.unlink(filePath);

    return new Response(JSON.stringify({ message: 'Article deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error deleting article' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
