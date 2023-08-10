import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
  ) {
    return await this.mediaService.update(id, updateMediaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: CreateMediaDto,
  ) {
    return await this.mediaService.uploadFile(file, data);
  }

  @Get('stream/:id')
  async StreamFile(@Res() res: Response, @Param('id') id: string) {
    const stream = await this.mediaService.stream(id);
    // forward errors
    stream.on('error', function error(err) {
      //continue to the next middlewares
      console.log(err);
      throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    });
    //Add the content type to the response (it's not propagated from the S3 SDK)
    // res.set('Content-Type', stream.);

    stream.on('end', () => {
      console.log('Served by Amazon S3: ');
    });
    //Pipe the s3 object to the response
    stream.pipe(res);
  }
}
