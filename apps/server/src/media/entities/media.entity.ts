import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: 'audio' | 'video';

  @Column()
  title: string;

  @Column()
  size: number;

  @Column()
  length: number;

  @Column()
  file_url: string;

  @Column()
  author: string;
}
