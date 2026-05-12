import { prisma } from '@/lib/prisma';

// TODO: replace with session.user.id once NextAuth is wired
export async function getFirstUserId(): Promise<string> {
  const user = await prisma.user.findFirstOrThrow({ select: { id: true } });
  return user.id;
}
