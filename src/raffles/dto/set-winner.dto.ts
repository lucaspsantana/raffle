import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class SetWinnerDto {
  @ApiProperty({
    description: 'Número do bilhete vencedor',
    example: 42,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'O número do bilhete vencedor é obrigatório' })
  @IsInt({ message: 'O número do bilhete deve ser um número inteiro' })
  @Min(1, { message: 'O número do bilhete deve ser maior que zero' })
  winningNumber: number;
}
