import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth } from './decorator/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { SignInDto } from './dtos/signin.dto';
import { RefreshToken } from './dtos/refresh-token.dto';
import { SignUpDto } from './dtos/signup.dto';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {
    // Constructor logic can be added here if needed
  }
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  refreshToken(@Body() refreshTokenDto: RefreshToken) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @Auth(AuthType.None)
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.register(signUpDto);
  }

  @Get('me')
  @Auth(AuthType.Bearer)
  async getProfile(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) {
      return { message: 'User not found' };
    }
    const user = await this.usersService.findOne(userId);
    return user;
  }
}
