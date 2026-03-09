import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { CreateClientDto } from '../auth/dto/create-client.dto';

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
   * Busca usuário por ID
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
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
}
