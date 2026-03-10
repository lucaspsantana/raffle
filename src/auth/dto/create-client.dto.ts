import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsCpf } from '../../common/validators/is-cpf.validator';

export class CreateClientDto {
  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'joao@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do cliente (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'CPF do cliente (11 dígitos)',
    example: '12345678901',
    pattern: '^\\d{11}$',
  })
  @IsString()
  @IsCpf()
  cpf: string;

  @ApiPropertyOptional({
    description: 'Telefone do cliente (10 ou 11 dígitos)',
    example: '11987654321',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'O telefone deve conter 10 ou 11 dígitos',
  })
  phone?: string;
}
