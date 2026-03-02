import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID ?? '',
  tokenSecret: process.env.MUX_TOKEN_SECRET ?? '',
});

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const upload = await mux.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['public'],
      },
    });

    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
    });
  } catch (error) {
    console.error('[mux/upload] Error creating upload:', error);
    return NextResponse.json({ error: 'Failed to create video upload' }, { status: 500 });
  }
}
