import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import type { Response } from 'express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createReadStream } from 'fs';
import { join } from 'path';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `raffle-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Upload de imagem (Admin)',
    description: 'Faz upload de uma imagem para ser usada em rifas. Aceita apenas JPG, JPEG, PNG e GIF. Tamanho máximo: 5MB',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (JPG, JPEG, PNG ou GIF)',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Imagem enviada com sucesso',
    schema: {
      example: {
        filename: 'raffle-1234567890-123456789.jpg',
        url: '/uploads/raffle-1234567890-123456789.jpg',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Arquivo inválido ou não enviado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas Admin' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      filename: file.filename,
      url: `/uploads/${file.filename}`,
    };
  }

  @Get(':filename')
  @ApiOperation({ 
    summary: 'Servir imagem',
    description: 'Retorna uma imagem armazenada no servidor',
  })
  @ApiParam({ name: 'filename', description: 'Nome do arquivo', example: 'raffle-1234567890-123456789.jpg' })
  @ApiResponse({ status: 200, description: 'Imagem retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = join(process.cwd(), 'uploads', filename);
    const file = createReadStream(filepath);
    file.pipe(res);
  }
}
