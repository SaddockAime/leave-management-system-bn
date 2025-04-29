// src/models/Setting.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
  
  @Entity('settings')
  export class Setting {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column({ unique: true })
    key!: string;
  
    @Column({ type: 'text' })
    value!: string;
  
    @Column({ nullable: true })
    description!: string;
  
    @Column({ default: 'string' })
    dataType!: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
  }