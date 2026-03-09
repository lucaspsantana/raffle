import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para compra de bilhete
 * Valida: Requisitos 6.1, 11.6
 */
export class PurchaseTicketDto {
  @ApiProperty({
    description: 'ID da rifa para comprar bilhete',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  raffleId: string;
}
