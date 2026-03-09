import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Ticket, Prisma } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates a unique random ticket number for a raffle
   * Numbers are in the range [1, maxTickets]
   */
  async generateUniqueTicketNumber(raffleId: string): Promise<number> {
    const maxAttempts = 10;
    let attempts = 0;

    // Fetch the raffle to get maxTickets
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      select: { maxTickets: true },
    });

    if (!raffle) {
      throw new NotFoundException('Raffle not found');
    }

    while (attempts < maxAttempts) {
      // Generate random number between 1 and maxTickets (inclusive)
      const randomNumber = Math.floor(Math.random() * raffle.maxTickets) + 1;

      const isTaken = await this.isNumberTaken(raffleId, randomNumber);

      if (!isTaken) {
        return randomNumber;
      }

      attempts++;
    }

    throw new Error('Unable to generate unique ticket number after maximum attempts');
  }

  /**
   * Purchases a ticket for a raffle with automatic unique number generation
   * Uses Serializable isolation level to prevent race conditions
   */
  async purchase(userId: string, raffleId: string): Promise<Ticket> {
    return await this.prisma.$transaction(
      async (tx) => {
        // Verify raffle exists and is active
        const raffle = await tx.raffle.findUnique({
          where: { id: raffleId },
          include: {
            _count: {
              select: { tickets: true },
            },
          },
        });

        if (!raffle) {
          throw new NotFoundException('Raffle not found');
        }

        // Check if raffle is still active
        if (new Date(raffle.closingDate) < new Date()) {
          throw new BadRequestException('This raffle is already closed');
        }

        // Check if there are available tickets
        if (raffle._count.tickets >= raffle.maxTickets) {
          throw new BadRequestException('This raffle is sold out');
        }

        // Generate unique ticket number
        const ticketNumber = await this.generateUniqueTicketNumber(raffleId);

        // Create the ticket
        try {
          return await tx.ticket.create({
            data: {
              number: ticketNumber,
              raffleId,
              userId,
              purchaseDate: new Date(),
            },
          });
        } catch (error) {
          // If we get a unique constraint violation, retry the purchase
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // Recursively retry the purchase
            return this.purchase(userId, raffleId);
          }
          throw error;
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  /**
   * Checks if a ticket number is already taken for a raffle
   */
  async isNumberTaken(raffleId: string, number: number): Promise<boolean> {
    const ticket = await this.prisma.ticket.findUnique({
      where: {
        raffleId_number: {
          raffleId,
          number,
        },
      },
    });

    return ticket !== null;
  }

  /**
   * Lists all tickets purchased by a user
   */
  async findByUser(userId: string): Promise<Ticket[]> {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: {
        raffle: true,
      },
      orderBy: { purchaseDate: 'desc' },
    });
  }

  /**
   * Lists all tickets for a specific raffle
   */
  async findByRaffle(raffleId: string): Promise<Ticket[]> {
    return this.prisma.ticket.findMany({
      where: { raffleId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
          },
        },
      },
      orderBy: { number: 'asc' },
    });
  }
}
