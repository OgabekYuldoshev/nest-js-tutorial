import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { tokenService } from 'src/services/token.service';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: LoginDto;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['authorization'] as string;

    if (!token || !token.startsWith('Bearer ')) {
      return false;
    }
    const authToken = token.split(' ')[1];

    if (!tokenService.has(authToken)) return false;

    const user = tokenService.get<LoginDto>(authToken);

    console.log(user);

    request.user = user;

    return true;
  }
}
