import { HttpException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { storeService } from 'src/services/store.service';
import { LoginDto } from './dto/login.dto';
import { uid } from 'radash';
import { tokenService } from 'src/services/token.service';

@Injectable()
export class AuthService {
  registerUser(values: RegisterDto) {
    storeService.set(values.username, values);

    return storeService.get<RegisterDto>(values.username);
  }

  loginUser(values: LoginDto) {
    const user = storeService.get<RegisterDto>(values.username);
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    if (user.password !== values.password) {
      throw new HttpException('Invalid password', 401);
    }
    const token = uid(32);
    tokenService.set(token, {
      username: user.username,
      fullname: user.fullname,
    });

    return {
      token,
      user: {
        username: user.username,
        fullname: user.fullname,
      },
    };
  }
}
