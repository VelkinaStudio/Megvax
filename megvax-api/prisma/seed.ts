import { PrismaClient, Plan, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@megvax.com';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash('admin123456', 12),
      fullName: 'MegVax Admin',
      isAdmin: true,
      emailVerified: true,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'megvax-demo' },
    update: {},
    create: {
      name: 'MegVax Demo',
      slug: 'megvax-demo',
      plan: Plan.AGENCY,
      settings: { timezone: 'Europe/Istanbul', currency: 'TRY' },
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId: admin.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      workspaceId: workspace.id,
      role: Role.OWNER,
    },
  });

  console.log('Seed complete: admin user + demo workspace created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
