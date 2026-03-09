/**
 * Script de Seed Manual para criar usuário Admin
 * 
 * Execute com: node prisma/seed-manual.js
 * 
 * Este script cria um usuário Admin padrão no banco de dados.
 * Credenciais:
 * - Email: admin@fiquerycо.com
 * - Senha: admin123
 */

const postgres = require('postgres');
const bcrypt = require('bcrypt');
require('dotenv/config');

async function main() {
  console.log('🌱 Iniciando seed...');

  // Remover o parâmetro schema da URL do banco de dados
  const databaseUrl = process.env.DATABASE_URL.replace(/\?schema=\w+/, '');
  
  // Conectar ao banco de dados usando postgres
  const sql = postgres(databaseUrl);

  try {
    console.log('✅ Conectado ao banco de dados');

    // Hash da senha padrão para o Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('🔐 Senha hasheada');

    // Verificar se o admin já existe
    const existingUser = await sql`
      SELECT * FROM "User" WHERE email = 'admin@fiquerycо.com'
    `;

    if (existingUser.length > 0) {
      console.log('ℹ️  Usuário Admin já existe, atualizando...');
      
      // Atualizar usuário existente
      const updatedUser = await sql`
        UPDATE "User" 
        SET password = ${hashedPassword}, 
            name = 'Administrador', 
            role = 'ADMIN', 
            "updatedAt" = NOW()
        WHERE email = 'admin@fiquerycо.com'
        RETURNING id, email, name, role
      `;

      console.log('✅ Usuário Admin atualizado:', {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        name: updatedUser[0].name,
        role: updatedUser[0].role,
      });
    } else {
      console.log('➕ Criando novo usuário Admin...');
      
      // Criar novo usuário Admin
      const newUser = await sql`
        INSERT INTO "User" (id, email, password, name, role, cpf, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'admin@fiquerycо.com', ${hashedPassword}, 'Administrador', 'ADMIN', NULL, NOW(), NOW())
        RETURNING id, email, name, role
      `;

      console.log('✅ Usuário Admin criado:', {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role,
      });
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📝 Credenciais do Admin:');
    console.log('   Email: admin@fiquerycо.com');
    console.log('   Senha: admin123');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('👋 Desconectado do banco de dados');
  }
}

main();
