import { ConfigService } from '@nestjs/config';

export const getS3Config = (configService: ConfigService) => {
  const region = configService.getOrThrow<string>('AWS_REGION');
  const bucketName = configService.getOrThrow<string>('AWS_S3_BUCKET');

  return {
    region,
    accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
    bucketName,
    publicUrl: `https://${bucketName}.s3.${region}.amazonaws.com`,
  };
};
