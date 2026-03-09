import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../auth.service';

/**
 * JwtStrategy para validação de tokens JWT
 * Valida: Requisitos 1.3, 1.4
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  /**
   * Valida o payload do token JWT e retorna o usuário
   * Este método é chamado automaticamente pelo Passport após verificar a assinatura do token
   * Valida: Requisitos 1.3, 1.4
   */
  async validate(payload: JwtPayload) {
    // Busca o usuário no banco de dados para garantir que ainda existe
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    // Se o usuário não existe mais, rejeita o token
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Retorna os dados do usuário que serão anexados ao request
    // O Passport automaticamente adiciona isso em request.user
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }
}
