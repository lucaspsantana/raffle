import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Gera hash de senha usando bcrypt
   * Valida: Requisitos 1.1, 1.2
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compara senha com hash
   * Valida: Requisitos 1.1, 1.2
   */
  async comparePasswords(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Valida credenciais e retorna JWT
   * Valida: Requisitos 1.1, 1.2, 1.3
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; user: any }> {
    try {
      // Busca usuário por email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Valida se usuário existe
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compara senha
    const isPasswordValid = await this.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Gera payload do JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Gera token JWT
    const access_token = this.jwtService.sign(payload);

    // Retorna token e dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid credentials');
    }
    
  }

  /**
   * Valida token JWT e retorna payload
   * Valida: Requisitos 1.3, 1.4
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
