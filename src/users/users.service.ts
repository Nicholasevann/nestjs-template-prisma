import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const userExist = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (userExist) throw new BadRequestException('Email already used');

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const savedUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    return {
      message: 'User created successfully',
      data: savedUser,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'desc',
      search,
    } = paginationDto;

    // Convert to numbers
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortOrder.toLowerCase() as 'asc' | 'desc' },
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      message: 'Users retrieved successfully',
      data: users,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPage: Math.ceil(total / limitNumber),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    delete user.password;
    return {
      message: user ? 'User found' : 'User not found',
      data: user,
    };
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return {
      message: 'User updated successfully',
      data: null,
    };
  }

  async remove(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'User deleted successfully',
      data: null,
    };
  }
}
