import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    this.authService.registerUser(body);

    return {
      message: 'User registered successfull',
    };
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.loginUser(body);
  }

  @Get('check-token')
  @UseGuards(AuthGuard)
  checkToken(@Req() request: Request) {
    return request.user!;
  }
}
