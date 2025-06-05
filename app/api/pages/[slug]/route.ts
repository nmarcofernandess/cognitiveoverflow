import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'pages');

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const filePath = path.join(DATA_DIR, `${params.slug}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (e) {
    return NextResponse.json({ content: '' });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { content } = await request.json();
  const filePath = path.join(DATA_DIR, `${params.slug}.json`);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify({ content }), 'utf8');
  return NextResponse.json({ success: true });
}
