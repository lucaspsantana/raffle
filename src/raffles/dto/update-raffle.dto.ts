import {
  IsString,
  IsDateString,
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsFutureDate } from '../../common/validators/is-future-date.validator';

export class UpdateRaffleDto {
  @ApiPropertyOptional({
    description: 'Título da rifa',
    example: 'Rifa do iPhone 15',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada da rifa',
    example: 'Concorra a um iPhone 15 Pro Max 256GB',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Data de encerramento da rifa (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsFutureDate()
  @IsOptional()
  closingDate?: string;

  @ApiPropertyOptional({
    description: 'Preço do bilhete',
    example: 10.0,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  ticketPrice?: number;

  @ApiPropertyOptional({
    description: 'Número máximo de bilhetes/cotas',
    example: 1000,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @IsOptional()
  maxTickets?: number;

  @ApiPropertyOptional({
    description: 'URL da imagem da rifa',
    example: '/uploads/raffle-1234567890.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'ID do usuário ganhador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  winnerId?: string;
}
