// src/models/Document.ts

import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
  } from 'typeorm';
  import { LeaveRequest } from './LeaveRequest';
  
  @Entity('documents')
  export class Document {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column({ name: 'leave_request_id' })
    leaveRequestId!: string;
  
    @ManyToOne(() => LeaveRequest, leaveRequest => leaveRequest.documents)
    @JoinColumn({ name: 'leave_request_id' })
    leaveRequest!: LeaveRequest;
  
    @Column({ name: 'file_name' })
    fileName!: string;
  
    @Column({ name: 'file_path' })
    filePath!: string;
  
    @Column({ name: 'file_type' })
    fileType!: string;
  
    @Column({ name: 'file_size' })
    fileSize!: number;
  
    @Column({ nullable: true })
    description!: string;
  
    @Column({ name: 'uploaded_by' })
    uploadedBy!: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
  }