/**
 * Seed manual de Raffles
 *
 * Execute com:
 * node prisma/raffle-seed-manual.js
 */

const postgres = require('postgres');
require('dotenv/config');

async function main() {
  console.log('🌱 Iniciando seed de raffles...');

  const databaseUrl = process.env.DATABASE_URL.replace(/\?schema=\w+/, '');
  const sql = postgres(databaseUrl);

  try {
    console.log('✅ Conectado ao banco');

    const raffles = [
      {
        title: "New Audi A3 SportBacK",
        description: "Ação com apenas 10 mil números. Aqui a chance é real.",
        closingDate: "2026-03-07 20:39:50",
        ticketPrice: 49.9,
        maxTickets: 10000,
        winnerId: "57819"
      },
      {
        title: "VW T-CROSS 0KM 2026",
        description: "Ação com apenas 10 mil números. Aqui a chance é real.",
        closingDate: "2026-03-04 20:30:23",
        ticketPrice: 37.9,
        maxTickets: 10000,
        winnerId: "41626"
      },
      {
        title: "New Porsche Macan Black",
        description: "Ação com apenas 10 mil números. Aqui a chance é real.",
        closingDate: "2026-02-28 20:31:38",
        ticketPrice: 79.9,
        maxTickets: 10000,
        winnerId: "134310"
      },
      {
        title: "Nova evoque black EDITION",
        description: "Ação com apenas 10 mil números. Aqui a chance é real.",
        closingDate: "2026-02-25 20:30:26",
        ticketPrice: 49.9,
        maxTickets: 10000,
        winnerId: "11926"
      },
      {
        title: "Novo Tera 0KM 2026",
        description: "Ação com apenas 10 mil números. Aqui a chance é real.",
        closingDate: "2026-02-21 20:38:48",
        ticketPrice: 37.9,
        maxTickets: 10000,
        winnerId: "66083"
      },
      {
        title: "Novo Volvo XC40 do Sampa",
        description: "Ação com apenas 10 mil números. Aqui a chance é real.",
        closingDate: "2026-02-21 20:39:11",
        ticketPrice: 39.9,
        maxTickets: 10000,
        winnerId: "69839"
      }
    ];

    for (const raffle of raffles) {
      console.log(`🎟 Criando rifa: ${raffle.title}`);

      await sql`
        INSERT INTO "Raffle"
        (
          id,
          title,
          description,
          "closingDate",
          "ticketPrice",
          "maxTickets",
          "winnerId",
          "createdAt",
          "updatedAt"
        )
        VALUES
        (
          gen_random_uuid(),
          ${raffle.title},
          ${raffle.description},
          ${raffle.closingDate},
          ${raffle.ticketPrice},
          ${raffle.maxTickets},
          ${raffle.winnerId},
          NOW(),
          NOW()
        )
      `;
    }

    console.log("✅ Todas as rifas foram criadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro no seed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sql.end();
    console.log("👋 Conexão encerrada");
  }
}

main();