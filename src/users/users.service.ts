import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { CreateClientDto } from '../auth/dto/create-client.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria novo cliente com CPF
   * Valida: Requisitos 2.1
   */
  async createClient(data: CreateClientDto, hashedPassword: string): Promise<User> {
    // Verifica se CPF já existe
    const existingCpf = await this.findByCpf(data.cpf);
    if (existingCpf) {
      throw new ConflictException('CPF already registered');
    }

    // Verifica se email já existe
    const existingEmail = await this.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Valida formato de CPF
    if (!this.validateCpf(data.cpf)) {
      throw new ConflictException('Invalid CPF format');
    }

    // Cria cliente
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        cpf: data.cpf,
        phone: data.phone,
        role: UserRole.CLIENT,
      },
    });
  }

  /**
   * Busca usuário por email
   * Valida: Requisitos 1.1, 1.2
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Busca usuário por CPF
   * Valida: Requisitos 2.2
   */
  async findByCpf(cpf: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { cpf },
    });
  }

  /**
   * Valida formato de CPF
   * Valida: Requisitos 2.3, 12.2
   */
  validateCpf(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleanCpf = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cleanCpf.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return false;
    }

    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCpf.charAt(9))) {
      return false;
    }

    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCpf.charAt(10))) {
      return false;
    }

    return true;
  }

  /**
   * Busca usuário por ID (sem retornar senha)
   */
  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Busca usuário por ID (com senha - uso interno)
   */
  private async findByIdWithPassword(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.findByIdWithPassword(userId);
      if (!user) {
        throw new ConflictException('User not found');
      }

      // Se está tentando alterar a senha, valida a senha atual
      if (data.newPassword) {
        if (!data.currentPassword) {
          throw new ConflictException(
            'Current password is required to change password',
          );
        }

        const isPasswordValid = await bcrypt.compare(
          data.currentPassword,
          user.password,
        );

        if (!isPasswordValid) {
          throw new ConflictException('Current password is incorrect');
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(data.newPassword, 10);

        const updatedUser = await this.prisma.user.update({
          where: { id: userId },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.phone !== undefined && { phone: data.phone }),
            password: hashedPassword,
          },
        });

        // Remove a senha do retorno
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
      }

      // Atualiza apenas nome e telefone
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.phone !== undefined && { phone: data.phone }),
        },
      });

      // Remove a senha do retorno
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}
