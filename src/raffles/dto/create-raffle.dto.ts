import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsFutureDate } from '../../common/validators/is-future-date.validator';

export class CreateRaffleDto {
  @ApiProperty({
    description: 'Título da rifa',
    example: 'Rifa do iPhone 15',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada da rifa',
    example: 'Concorra a um iPhone 15 Pro Max 256GB',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Data de encerramento da rifa (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsFutureDate()
  closingDate: string;

  @ApiProperty({
    description: 'Preço do bilhete',
    example: 10.0,
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  ticketPrice: number;

  @ApiProperty({
    description: 'Número máximo de bilhetes/cotas',
    example: 1000,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  maxTickets: number;

  @ApiPropertyOptional({
    description: 'URL da imagem da rifa',
    example: '/uploads/raffle-1234567890.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
