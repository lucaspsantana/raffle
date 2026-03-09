import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { SetWinnerDto } from './dto/set-winner.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { RafflesService } from './raffles.service';

@ApiTags('raffles')
@Controller('raffles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Criar nova rifa (Admin)',
    description: 'Cria uma nova rifa com título, descrição, data de encerramento, preço e número máximo de cotas',
  })
  @ApiResponse({ status: 201, description: 'Rifa criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas Admin' })
  async create(@Body() createRaffleDto: CreateRaffleDto) {
    return this.rafflesService.create(createRaffleDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todas as rifas',
    description: 'Retorna todas as rifas cadastradas no sistema',
  })
  @ApiResponse({ status: 200, description: 'Lista de rifas retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findAll() {
    return this.rafflesService.findAll();
  }

  @Get('active')
  @ApiOperation({ 
    summary: 'Listar rifas ativas',
    description: 'Retorna apenas rifas com data de encerramento futura, ordenadas por data',
  })
  @ApiResponse({ status: 200, description: 'Lista de rifas ativas retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findActive() {
    return this.rafflesService.findActive();
  }

  @Get('winners')
  @ApiOperation({ 
    summary: 'Listar rifas com ganhadores',
    description: 'Retorna rifas encerradas que possuem ganhador definido',
  })
  @ApiResponse({ status: 200, description: 'Lista de rifas com ganhadores retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findWithWinners() {
    return this.rafflesService.findWithWinners();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar rifa por ID',
    description: 'Retorna os detalhes de uma rifa específica',
  })
  @ApiParam({ name: 'id', description: 'ID da rifa', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Rifa encontrada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Rifa não encontrada' })
  async findById(@Param('id') id: string) {
    return this.rafflesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Atualizar rifa (Admin)',
    description: 'Atualiza os dados de uma rifa existente',
  })
  @ApiParam({ name: 'id', description: 'ID da rifa', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Rifa atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas Admin' })
  @ApiResponse({ status: 404, description: 'Rifa não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateRaffleDto: UpdateRaffleDto,
  ) {
    return this.rafflesService.update(id, updateRaffleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Deletar rifa (Admin)',
    description: 'Remove uma rifa do sistema e sua imagem associada',
  })
  @ApiParam({ name: 'id', description: 'ID da rifa', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Rifa deletada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas Admin' })
  @ApiResponse({ status: 404, description: 'Rifa não encontrada' })
  async delete(@Param('id') id: string) {
    await this.rafflesService.delete(id);
    return { message: 'Raffle deleted successfully' };
  }

  @Patch(':id/winner')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Definir ganhador da rifa (Admin)',
    description: 'Define o ganhador de uma rifa informando o número do bilhete vencedor. O sistema encontrará automaticamente o usuário que comprou aquele bilhete.',
  })
  @ApiParam({ name: 'id', description: 'ID da rifa', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Ganhador definido com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas Admin' })
  @ApiResponse({ status: 404, description: 'Rifa ou bilhete não encontrado' })
  async setWinner(
    @Param('id') id: string,
    @Body() setWinnerDto: SetWinnerDto,
  ) {
    return this.rafflesService.setWinner(id, setWinnerDto.winningNumber);
  }
}
