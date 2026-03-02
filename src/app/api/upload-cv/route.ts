import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = `${userId}/${String(Date.now())}.pdf`;

  const { error } = await supabaseAdmin.storage.from('cvs').upload(filePath, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  });

  if (error) {
    console.error('[upload-cv] Supabase upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage.from('cvs').getPublicUrl(filePath);

  return NextResponse.json({ url: urlData.publicUrl });
}
