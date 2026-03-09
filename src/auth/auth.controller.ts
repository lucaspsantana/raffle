import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateClientDto } from './dto/create-client.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * POST /auth/register - Cadastro de cliente
   * Valida: Requisitos 2.1
   */
  @Post('register')
  @ApiOperation({ 
    summary: 'Cadastrar novo cliente',
    description: 'Cria uma nova conta de cliente com CPF, nome, email e senha',
  })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Cliente cadastrado com sucesso',
    schema: {
      example: {
        message: 'Client registered successfully',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'João Silva',
          email: 'joao@example.com',
          cpf: '12345678901',
          role: 'CLIENT',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos (CPF inválido, email inválido, etc.)',
  })
  @ApiResponse({ 
    status: 409, 
    description: 'CPF ou email já cadastrado',
  })
  async register(@Body() createClientDto: CreateClientDto) {
    // Hash da senha
    const hashedPassword = await this.authService.hashPassword(
      createClientDto.password,
    );

    // Cria cliente
    const user = await this.usersService.createClient(
      createClientDto,
      hashedPassword,
    );

    // Remove senha da resposta
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Client registered successfully',
      user: userWithoutPassword,
    };
  }

  /**
   * POST /auth/login - Login de usuário
   * Valida: Requisitos 1.1
   */
  @Post('login')
  @ApiOperation({ 
    summary: 'Fazer login',
    description: 'Autentica um usuário (Admin ou Cliente) e retorna um token JWT',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'João Silva',
          email: 'joao@example.com',
          role: 'CLIENT',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciais inválidas',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
