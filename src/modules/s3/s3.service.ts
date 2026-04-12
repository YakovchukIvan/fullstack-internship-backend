import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { getS3Config } from '@/config/s3.config';
import { AppLogger } from '@/common/logger/app-logger';

export type S3Folder = 'users' | 'companies';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(
    configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(S3Service.name);

    const config = getS3Config(configService);

    this.bucket = config.bucketName;
    this.publicUrl = config.publicUrl;

    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: S3Folder): Promise<string> {
    const key = this.generateUniqueKey(file, folder);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentLength: file.size,
        }),
      );

      const url = this.getPublicUrl(key);
      this.logger.log({ url, folder, size: file.size }, 'File uploaded to S3');
      return url;
    } catch (error) {
      this.logger.logError('Failed to upload file to S3', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const key = this.extractKeyFromUrl(url);

      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      this.logger.log({ key }, 'File deleted from S3');
    } catch (error) {
      this.logger.logError('Failed to delete file from S3', error);
    }
  }

  private getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  private extractKeyFromUrl(url: string): string {
    return url.replace(`${this.publicUrl}/`, '');
  }

  private generateUniqueKey(file: Express.Multer.File, folder: S3Folder): string {
    const ext = this.resolveExtension(file);
    return `${folder}/${randomUUID()}${ext}`;
  }

  private resolveExtension(file: Express.Multer.File): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };

    return mimeToExt[file.mimetype] ?? '.jpg';
  }
}
