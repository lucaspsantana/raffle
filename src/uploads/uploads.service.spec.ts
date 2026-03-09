import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { promises as fs } from 'fs';
import { join } from 'path';

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveFile', () => {
    it('should save file and return filename', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const filename = await service.saveFile(mockFile);

      expect(filename).toMatch(/^raffle-\d+-\d+\.jpg$/);
      expect(fs.writeFile).toHaveBeenCalledWith(
        join('./uploads', filename),
        mockFile.buffer,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file from filesystem', async () => {
      const filename = 'raffle-123-456.jpg';

      await service.deleteFile(filename);

      expect(fs.unlink).toHaveBeenCalledWith(join('./uploads', filename));
    });

    it('should not throw error if file does not exist', async () => {
      const filename = 'nonexistent.jpg';
      (fs.unlink as jest.Mock).mockRejectedValue(new Error('File not found'));

      await expect(service.deleteFile(filename)).resolves.not.toThrow();
    });

    it('should handle empty filename', async () => {
      await service.deleteFile('');

      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });

  describe('generateFilename', () => {
    it('should generate unique filename with correct extension', () => {
      const originalName = 'test.jpg';
      const filename = service.generateFilename(originalName);

      expect(filename).toMatch(/^raffle-\d+-\d+\.jpg$/);
    });

    it('should handle different extensions', () => {
      const filename1 = service.generateFilename('test.png');
      const filename2 = service.generateFilename('test.gif');

      expect(filename1).toMatch(/\.png$/);
      expect(filename2).toMatch(/\.gif$/);
    });

    it('should generate different filenames for same original name', () => {
      const filename1 = service.generateFilename('test.jpg');
      const filename2 = service.generateFilename('test.jpg');

      expect(filename1).not.toBe(filename2);
    });
  });

  describe('validateFileType', () => {
    it('should accept valid image types', () => {
      expect(service.validateFileType('image/jpeg')).toBe(true);
      expect(service.validateFileType('image/jpg')).toBe(true);
      expect(service.validateFileType('image/png')).toBe(true);
      expect(service.validateFileType('image/gif')).toBe(true);
    });

    it('should reject invalid file types', () => {
      expect(service.validateFileType('application/pdf')).toBe(false);
      expect(service.validateFileType('text/plain')).toBe(false);
      expect(service.validateFileType('video/mp4')).toBe(false);
    });
  });
});
