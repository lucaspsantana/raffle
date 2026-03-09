import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

/**
 * TicketsController - Gerencia compra e listagem de bilhetes
 * Valida: Requisitos 6.1, 7.1, 7.2, 7.3, 9.1, 9.2
 */
@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * POST /tickets/purchase - Comprar bilhete [Cliente]
   * Valida: Requisitos 6.1, 7.1, 7.2, 7.3
   */
  @Post('purchase')
  @ApiOperation({ 
    summary: 'Comprar bilhete',
    description: 'Compra um bilhete de uma rifa ativa com número aleatório único',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Bilhete comprado com sucesso',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        number: 42,
        raffleId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        purchaseDate: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Rifa encerrada ou esgotada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Rifa não encontrada' })
  async purchase(@Request() req, @Body() purchaseTicketDto: PurchaseTicketDto) {
    const userId = req.user.id;
    return this.ticketsService.purchase(userId, purchaseTicketDto.raffleId);
  }

  /**
   * GET /tickets/my-tickets - Listar meus bilhetes [Cliente]
   * Valida: Requisitos 9.1, 9.2
   */
  @Get('my-tickets')
  @ApiOperation({ 
    summary: 'Listar meus bilhetes',
    description: 'Retorna todos os bilhetes comprados pelo cliente autenticado',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de bilhetes retornada com sucesso',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          number: 42,
          raffleId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          purchaseDate: '2024-01-01T00:00:00.000Z',
          raffle: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Rifa do iPhone 15',
            description: 'Concorra a um iPhone 15 Pro Max',
            closingDate: '2024-12-31T23:59:59.000Z',
            ticketPrice: 10.0,
            maxTickets: 1000,
            imageUrl: '/uploads/raffle-1234567890.jpg',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getMyTickets(@Request() req) {
    const userId = req.user.id;
    return this.ticketsService.findByUser(userId);
  }

  /**
   * GET /tickets/raffle/:id - Listar bilhetes de uma rifa [Admin]
   * Valida: Requisitos 9.1, 9.2
   */
  @Get('raffle/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Listar bilhetes de uma rifa (Admin)',
    description: 'Retorna todos os bilhetes vendidos de uma rifa específica',
  })
  @ApiParam({ name: 'id', description: 'ID da rifa', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de bilhetes retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas Admin' })
  async getRaffleTickets(@Param('id') raffleId: string) {
    return this.ticketsService.findByRaffle(raffleId);
  }
}
