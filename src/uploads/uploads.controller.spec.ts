import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';

jest.mock('fs', () => ({
  createReadStream: jest.fn(),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

describe('UploadsController', () => {
  let controller: UploadsController;
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [UploadsService],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
    service = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file and return filename and url', async () => {
      const mockFile = {
        filename: 'raffle-123-456.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const result = await controller.uploadFile(mockFile);

      expect(result).toEqual({
        filename: 'raffle-123-456.jpg',
        url: '/uploads/raffle-123-456.jpg',
      });
    });

    it('should throw error if no file uploaded', async () => {
      await expect(controller.uploadFile(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('serveFile', () => {
    it('should serve file', async () => {
      const filename = 'raffle-123-456.jpg';
      const mockResponse = {
        pipe: jest.fn(),
      } as any;
      const mockStream = {
        pipe: jest.fn(),
      };

      (createReadStream as jest.Mock).mockReturnValue(mockStream);

      await controller.serveFile(filename, mockResponse as Response);

      expect(createReadStream).toHaveBeenCalled();
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });
  });
});
