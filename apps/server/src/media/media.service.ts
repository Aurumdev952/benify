import { Injectable, Req, Res } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import * as AWS from 'aws-sdk';

@Injectable()
export class MediaService {
  AWS_S3_BUCKET = 'benifyfiles';
  s3 = new AWS.S3({
    endpoint: 's3.us-east-005.backblazeb2.com',
    region: 'us-east-005',
    credentials: new AWS.Credentials({
      accessKeyId: process.env.KEY_ID,
      secretAccessKey: process.env.KEY_SECRET,
    }),
    s3ForcePathStyle: true,
    useAccelerateEndpoint: true,
  });
  create(createMediaDto: CreateMediaDto) {
    return 'This action adds a new media';
  }

  async uploadFile(file: Express.Multer.File) {
    console.log(file);
    const { originalname } = file;

    return await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );
  }
  async s3_upload(file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ContentType: mimetype,
      // ContentDisposition: 'inline',
    };

    try {
      const s3Response = await this.s3.upload(params).promise();
      return s3Response;
    } catch (e) {
      console.log(e);
    }
  }
  findAll() {
    return `This action returns all media`;
  }

  findOne(id: number) {
    return `This action returns a #${id} media`;
  }

  update(id: number, updateMediaDto: UpdateMediaDto) {
    return `This action updates a #${id} media`;
  }

  remove(id: number) {
    return `This action removes a #${id} media`;
  }
}
