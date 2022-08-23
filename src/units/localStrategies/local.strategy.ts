import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginUsersDTO } from '../users/users.login.dto';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super();
  }

  async validate(dto: LoginUsersDTO): Promise<any> {
    const user = await this.userService.Auth(dto);
    console.log(user);
    if (!user) {
      console.log(user);
      // throw new UnauthorizedException();
    }
    return user;
  }
}