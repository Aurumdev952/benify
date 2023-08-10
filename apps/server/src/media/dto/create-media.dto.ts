import { IsEmail, IsNotEmpty } from 'class-validator';
export class CreateMediaDto {
  @IsNotEmpty()
  author: string;

  @IsNotEmpty()
  title: string;
}
