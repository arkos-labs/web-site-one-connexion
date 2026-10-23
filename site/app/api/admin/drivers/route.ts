import { NextResponse } from 'next/server';
import { adminSupabase, driverPhoto, requireAdmin } from '@/lib/admin-auth';

// Liste des chauffeurs (admin) : photo de chacun, { photos: { [drivers.id]: url } }.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = adminSupabase();
  const { data: drivers } = await admin.from('drivers').select('id, auth_id').not('auth_id', 'is', null);
  const rows = (drivers ?? []) as { id: string; auth_id: string }[];
  if (!rows.length) return NextResponse.json({ photos: {} });

  const { data: profiles } = await admin.from('profiles').select('id, avatar_url').in('id', rows.map((d) => d.auth_id));
  const profileAvatar = new Map((profiles ?? []).map((p: { id: string; avatar_url: string | null }) => [p.id, p.avatar_url]));

  const photos: Record<string, string> = {};
  await Promise.all(
    rows.map(async (d) => {
      const { data } = await admin.auth.admin.getUserById(d.auth_id);
      const url = driverPhoto(data.user?.user_metadata, profileAvatar.get(d.auth_id));
      if (url) photos[d.id] = url;
    })
  );
  return NextResponse.json({ photos });
}
