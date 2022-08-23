import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  setupFinish(): string{
    return 'Setup Complete!';
  }

  installFinish(): string{
    return 'Install Complete!';
  }
}
