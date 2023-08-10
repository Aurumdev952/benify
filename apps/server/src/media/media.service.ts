import {
  HttpException,
  HttpStatus,
  Injectable,
  Req,
  Res,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import * as AWS from 'aws-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
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
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async uploadFile(file: Express.Multer.File, data: CreateMediaDto) {
    const { originalname, size } = file;

    const uploadRes = await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );
    const media = await this.mediaRepository.create({
      title: data.title,
      author: data.author,
      size: size,
      key: uploadRes.Key,
      file_url: uploadRes.Location,
    });
    return this.mediaRepository.save(media);
  }
  async s3_upload(
    file: Buffer,
    bucket: string,
    name: string,
    mimetype: string,
  ) {
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
  async s3_delete(bucket: string, key: string) {
    const params = {
      Bucket: bucket,
      Key: key,
      // ContentDisposition: 'inline',
    };

    try {
      const s3Response = await this.s3.deleteObject(params).promise();
      return s3Response;
    } catch (e) {
      console.log(e);
    }
  }
  s3_getobject(bucket: string, key: string) {
    const params = {
      Bucket: bucket,
      Key: key,
      // ContentDisposition: 'inline',
    };

    try {
      return this.s3.getObject(params).createReadStream();
    } catch (e) {
      console.log(e);
    }
  }
  async findAll() {
    return await this.mediaRepository.find();
  }

  async findOne(id: string) {
    const media = await this.mediaRepository.findOne({
      where: {
        id,
      },
    });
    if (!media) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    return media;
  }

  async update(id: string, data: UpdateMediaDto) {
    return await this.mediaRepository.update({ id }, { ...data });
  }

  async remove(id: string) {
    const media = await this.mediaRepository.findOne({
      where: {
        id,
      },
      select: {
        key: true,
      },
    });
    if (media) {
      const deleteRes = await this.s3_delete(this.AWS_S3_BUCKET, media.key);
      if (deleteRes) {
        return this.mediaRepository.delete({ id });
      } else {
        throw new HttpException(
          'Internal Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  async stream(id: string) {
    const media = await this.mediaRepository.findOne({
      where: {
        id,
      },
      select: {
        key: true,
      },
    });
    if (!media) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    return this.s3_getobject(this.AWS_S3_BUCKET, media.key);
  }
}
