import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'audio' })
  type: 'audio' | 'video';

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  size: number;

  @Column()
  file_url: string;

  @Column({ nullable: false })
  key: string;

  @Column({ nullable: false })
  author: string;
}
