import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { jwtConstants } from 'src/libs/constants/constants';
import { UsersService } from '../users/users.service';


@Injectable()
export class JwtStrategy extends AuthGuard('jwt'){//PassportStrategy(Strategy) {
  @Inject(UsersService)
  private readonly userService: UsersService;
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return this.userService.Auth(payload);
  }
}