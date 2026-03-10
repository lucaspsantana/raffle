import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Telefone do usuário',
    example: '11987654321',
  })
  @IsOptional()
  @IsString({ message: 'O telefone deve ser uma string' })
  @Matches(/^\d{10,11}$/, {
    message: 'O telefone deve conter 10 ou 11 dígitos',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Senha atual (obrigatória para alterar senha)',
    example: 'senhaAtual123',
  })
  @IsOptional()
  @IsString({ message: 'A senha atual deve ser uma string' })
  currentPassword?: string;

  @ApiPropertyOptional({
    description: 'Nova senha',
    example: 'novaSenha123',
  })
  @IsOptional()
  @IsString({ message: 'A nova senha deve ser uma string' })
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres' })
  newPassword?: string;
}
