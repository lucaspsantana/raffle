import { Injectable, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { extname } from 'path';

@Injectable()
export class UploadsService {
  private readonly uploadPath = './uploads';

  /**
   * Salva arquivo no filesystem
   */
  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = this.generateFilename(file.originalname);
    const filepath = join(this.uploadPath, filename);
    
    await fs.writeFile(filepath, file.buffer);
    
    return filename;
  }

  /**
   * Deleta arquivo do filesystem
   */
  async deleteFile(filename: string): Promise<void> {
    if (!filename) return;
    
    const filepath = join(this.uploadPath, filename);
    
    try {
      await fs.unlink(filepath);
    } catch (error) {
      // Arquivo pode não existir, ignorar erro
      console.warn(`Failed to delete file ${filename}:`, error.message);
    }
  }

  /**
   * Gera nome único para arquivo
   */
  generateFilename(originalName: string): string {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(originalName);
    return `raffle-${uniqueSuffix}${ext}`;
  }

  /**
   * Valida tipo de arquivo
   */
  validateFileType(mimetype: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    return allowedTypes.includes(mimetype);
  }
}
