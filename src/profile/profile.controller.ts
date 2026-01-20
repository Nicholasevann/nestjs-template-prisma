import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { UsersService } from 'src/users/users.service';

import { AuthType } from 'src/auth/enums/auth-type.enum';
@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @Auth(AuthType.Bearer)
  async get(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) {
      return { message: 'User not found' };
    }
    const user = await this.usersService.findOne(userId);
    return user;
  }

  @Patch()
  @Auth(AuthType.Bearer)
  async update(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user?.sub;
    if (!userId) {
      return { message: 'User not found' };
    }
    return this.usersService.update(userId, updateProfileDto);
  }

  @Delete('/delete-account')
  @Auth(AuthType.Bearer)
  async remove(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) {
      return { message: 'User not found' };
    }
    return this.usersService.remove(userId);
  }
}
