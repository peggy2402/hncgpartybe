import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;

  beforeEach(async () => {
    userModel = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: userModel },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // Helper function to generate valid data
  const validData = () => ({
    fullname: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: '123456',
    gender: 'male',
    birthdate: '2000-01-01',
  });

  it('should throw if missing required fields', async () => {
    await expect(service.register({})).rejects.toThrow('Missing required fields');
  });

  it('should throw if missing fullname', async () => {
    const data = validData();
    (data.fullname as any) = undefined;
    await expect(service.register(data)).rejects.toThrow('Missing required fields');
  });

  it('should throw if missing username', async () => {
    const data = validData();
    (data.username as any) = undefined;
    await expect(service.register(data)).rejects.toThrow('Missing required fields');
  });

  it('should throw if missing email', async () => {
    const data = validData();
    (data.email as any) = undefined;
    await expect(service.register(data)).rejects.toThrow('Missing required fields');
  });

  it('should throw if missing password', async () => {
    const data = validData();
    (data.password as any) = undefined;
    await expect(service.register(data)).rejects.toThrow('Missing required fields');
  });

  it('should throw if missing gender', async () => {
    const data = validData();
    (data.gender as any) = undefined;
    await expect(service.register(data)).rejects.toThrow('Missing required fields');
  });

  it('should throw if missing birthdate', async () => {
    const data = validData();
    (data.birthdate as any) = undefined;
    await expect(service.register(data)).rejects.toThrow('Missing required fields');
  });

  it('should throw if username or email already exists', async () => {
    userModel.findOne.mockResolvedValue({ _id: '123' });
    await expect(service.register(validData())).rejects.toThrow('Username or email already exists');
  });

  it('should hash password and register successfully with valid data', async () => {
    userModel.findOne.mockResolvedValue(null);
    (jest.spyOn(bcrypt, 'hash') as any).mockResolvedValue('hashedPassword');

    // Mock save and toObject
    const mockUserObj = {
      ...validData(),
      password: 'hashedPassword',
      avatarUrl: '',
      isOnline: false,
      coins: 0,
      level: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject: function () {
        // Loại bỏ password khi trả về
        const { password, ...rest } = this;
        return rest;
      },
      save: jest.fn().mockResolvedValue(this),
    };

    // Mock new this.userModel(...)
    function MockUser(data: any) {
      return { ...mockUserObj, ...data };
    }
    (service as any).userModel = Object.assign(MockUser, {
      findOne: userModel.findOne,
    });

    const result = await service.register(validData());

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(result.message).toBe('Register success');
    expect(result.user.username).toBe('testuser');
    expect(result.user.email).toBe('test@example.com');
    expect('password' in result.user).toBe(false);
  });

  it('should throw if birthdate is invalid date', async () => {
    userModel.findOne.mockResolvedValue(null);
    const data = validData();
    data.birthdate = 'invalid-date';
    await expect(service.register(data)).rejects.toThrow();
  });

  it('should throw if password is too short', async () => {
    const data = validData();
    data.password = '123';
    await expect(service.register(data)).rejects.toThrow();
  });

  it('should throw if email is invalid', async () => {
    const data = validData();
    data.email = 'not-an-email';
    await expect(service.register(data)).rejects.toThrow('Email is invalid');
  });

  it('should throw if fullname is too long', async () => {
    const data = validData();
    data.fullname = 'A'.repeat(300);
    await expect(service.register(data)).rejects.toThrow();
  });

  it('should throw if database error occurs', async () => {
    userModel.findOne.mockRejectedValue(new Error('DB error'));
    await expect(service.register(validData())).rejects.toThrow('DB error');
  });

  it('should throw if birthdate is in the future', async () => {
    const data = validData();
    data.birthdate = '2999-01-01';
    await expect(service.register(data)).rejects.toThrow();
  });

  it('should throw if username is too short', async () => {
    const data = validData();
    data.username = 'ab';
    await expect(service.register(data)).rejects.toThrow('Username is invalid');
  });

  it('should throw if username has invalid characters', async () => {
    const data = validData();
    data.username = 'user!@#';
    await expect(service.register(data)).rejects.toThrow('Username is invalid');
  });

});