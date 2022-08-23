import {
  Controller,
  Get,
  ParseFilePipeBuilder,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { exec } from 'child_process';
import { diskStorage } from 'multer';

import { AppService } from './app.service';
import { SendMailService } from './operations/mailer/mailer.service';

@Controller()
@ApiTags('Default Routes for Setup, Installation and Documents')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: SendMailService,
  ) {}

  @Get()
  getHello(@Res() res): string {
    return res.redirect('/documents');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('hello')
  getHell(): string {
    return this.appService.getHello();
  }

  @Get('setup')
  async setup(): Promise<string> {
    exec('npm run typeorm:migration:generate -d src/migrations');
    return this.appService.setupFinish();
  }



  @Get('install')
  async install(): Promise<string> {
    //await exec("migration run: npx typeorm migration:run -d ./dist/appDataSource.js")
    // npm run typeorm:migration:run -d src/config/migration.config
    return this.appService.installFinish();
  }

  @Get('sendMail')
  async sendMail(): Promise<string> {
    this.mailService.sendMail(
      'dogukanc760@hotmail.com',
      'Doğukan Canerler Leylandi-1 Adlı Sistem Sulama Yaparken İnternet Bağlantısı kesildi, lütfen sistemi kontrol ediniz.',
      '',
      'Doğukan Canerler',
      'smartmoles.com',
      'Bilgilendirme - Hata',
      'İşleyiş İçerisinde Ufak bir Hata Oluştu...',
    );

    return 'Hello World!';
  }

  @UseInterceptors(FileInterceptor('file', {
    storage : diskStorage({
      destination: './files'
    })
  }))
  @Post('upload')
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    try {
      return {file: file.filename};
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @Get('smartmoles')
  getSmartMoles(@Res() res) {
    return res.redirect('www.smartmoles.com');
  }
}
