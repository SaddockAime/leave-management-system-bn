// src/models/AuditLog.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
  } from 'typeorm';
  
  @Entity('audit_logs')
  export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column({ name: 'user_id' })
    userId!: string;
  
    @Column()
    action!: string;
  
    @Column({ name: 'entity_type' })
    entityType!: string;
  
    @Column({ name: 'entity_id' })
    entityId!: string;
  
    @Column({ type: 'jsonb', nullable: true })
    oldValues!: any;
  
    @Column({ type: 'jsonb', nullable: true })
    newValues!: any;
  
    @Column({ nullable: true })
    ipAddress!: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
  }