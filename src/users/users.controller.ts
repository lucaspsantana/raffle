import {
  Body,
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obter perfil do usuário autenticado',
    description:
      'Retorna as informações do usuário logado (Admin ou Cliente)',
  })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Atualizar perfil do usuário autenticado',
    description:
      'Permite ao usuário atualizar seu nome, telefone e senha. Para alterar a senha, é necessário informar a senha atual.',
  })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado ou senha incorreta' })
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(
      req.user.id,
      updateProfileDto,
    );
  }
}
