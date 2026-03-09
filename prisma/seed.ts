import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Hash da senha padrão para o Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Criar usuário Admin padrão
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fiquerycо.com' },
    update: {},
    create: {
      email: 'admin@fiquerycо.com',
      password: hashedPassword,
      name: 'Administrador',
      role: UserRole.ADMIN,
      cpf: null, // Admin não precisa de CPF
    },
  });

  console.log('Admin user created:', {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
