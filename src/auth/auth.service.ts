import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async register(data: any) {
    const { fullname, username, email, password, gender, birthdate } = data;
    if (!fullname || !username || !email || !password || !gender || !birthdate) {
      throw new BadRequestException('Missing required fields');
    }

    // Kiểm tra trùng username/email
    const existed = await this.userModel.findOne({ $or: [{ username }, { email }] });
    if (existed) throw new BadRequestException('Username or email already exists');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new this.userModel({
      fullname,
      username,
      email,
      password: hashedPassword,
      gender,
      birthdate: new Date(birthdate),
      avatarUrl: '',
      isOnline: false,
      coins: 0,
      level: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();
    const { password: _password, ...userObj } = newUser.toObject();
    return { message: 'Register success', user: userObj };
  }
}