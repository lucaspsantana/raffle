import { Injectable, NotFoundException } from '@nestjs/common';
import { Raffle } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';

@Injectable()
export class RafflesService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}

  async create(data: CreateRaffleDto): Promise<Raffle> {
    return this.prisma.raffle.create({
      data: {
        title: data.title,
        description: data.description,
        closingDate: new Date(data.closingDate),
        ticketPrice: data.ticketPrice,
        maxTickets: data.maxTickets,
        imageUrl: data.imageUrl,
      },
    });
  }

  async update(id: string, data: UpdateRaffleDto): Promise<Raffle> {
    const raffle = await this.findById(id);
    if (!raffle) {
      throw new NotFoundException(`Raffle with ID ${id} not found`);
    }

    return this.prisma.raffle.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.closingDate && { closingDate: new Date(data.closingDate) }),
        ...(data.ticketPrice && { ticketPrice: data.ticketPrice }),
        ...(data.maxTickets && { maxTickets: data.maxTickets }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.winnerId !== undefined && { winnerId: data.winnerId }),
      },
    });
  }

  async findAll(): Promise<Raffle[]> {
    return this.prisma.raffle.findMany({
      orderBy: { closingDate: 'desc' },
    });
  }

  async findActive(): Promise<Raffle[]> {
    return this.prisma.raffle.findMany({
      where: {
        closingDate: {
          gt: new Date(),
        },
      },
      orderBy: { closingDate: 'asc' },
    });
  }

  async findWithWinners(): Promise<Raffle[]> {
    return this.prisma.raffle.findMany({
      where: {
        closingDate: {
          lt: new Date(),
        },
        winnerId: {
          not: null,
        },
      },
      orderBy: { closingDate: 'desc' },
    });
  }

  async findById(id: string): Promise<Raffle | null> {
    return this.prisma.raffle.findUnique({
      where: { id },
    });
  }

  async delete(id: string): Promise<void> {
    const raffle = await this.findById(id);
    if (!raffle) {
      throw new NotFoundException(`Raffle with ID ${id} not found`);
    }

    // Extrair o nome do arquivo da URL da imagem, se existir
    if (raffle.imageUrl) {
      const filename = raffle.imageUrl.split('/').pop();
      if (filename) {
        await this.uploadsService.deleteFile(filename);
      }
    }

    await this.prisma.raffle.delete({
      where: { id },
    });
  }

  async setWinner(raffleId: string, winningNumber: number): Promise<Raffle> {
      const raffle = await this.findById(raffleId);
      if (!raffle) {
        throw new NotFoundException(`Raffle with ID ${raffleId} not found`);
      }

      // Buscar o bilhete com o número vencedor
      const winningTicket = await this.prisma.ticket.findUnique({
        where: {
          raffleId_number: {
            raffleId,
            number: winningNumber,
          },
        },
      });

      if (!winningTicket) {
        throw new NotFoundException(
          `Ticket with number ${winningNumber} not found for this raffle`,
        );
      }

      // Atualizar a rifa com o ID do usuário que comprou o bilhete vencedor
      return this.prisma.raffle.update({
        where: { id: raffleId },
        data: { winnerId: winningTicket.userId },
        include: {
          tickets: {
            where: { number: winningNumber },
            include: { user: true },
          },
        },
      });
    }

  isActive(raffle: Raffle): boolean {
    return new Date(raffle.closingDate) > new Date();
  }

  async hasAvailableTickets(raffleId: string): Promise<boolean> {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!raffle) {
      throw new NotFoundException(`Raffle with ID ${raffleId} not found`);
    }

    return raffle._count.tickets < raffle.maxTickets;
  }

  async getAvailableTicketsCount(raffleId: string): Promise<number> {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!raffle) {
      throw new NotFoundException(`Raffle with ID ${raffleId} not found`);
    }

    return raffle.maxTickets - raffle._count.tickets;
  }
}
