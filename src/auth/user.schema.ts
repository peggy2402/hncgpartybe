import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true }) fullname: string;
  @Prop({ required: true, unique: true }) username: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: true }) password: string;
  @Prop({ required: true }) gender: string;
  @Prop({ required: true }) birthdate: Date;
  @Prop({ default: '' }) avatarUrl: string;
  @Prop({ default: false }) isOnline: boolean;
  @Prop({ default: 0 }) coins: number;
  @Prop({ default: 1 }) level: number;
  @Prop({ default: Date.now }) createdAt: Date;
  @Prop({ default: Date.now }) updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);