import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/libs/api-results/standart-results';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UsersDTO } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users Endpoints')
@UseInterceptors(TransformInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  //@UseGuards(JwtAuthGuard)
  @Get()
  public async getAll(): Promise<UsersDTO[]> {
    return await this.usersService.getAll();
  }

  @Get(':id')
  public async get(@Param('id') id: string): Promise<UsersDTO> {
    return await this.usersService.get(id);
  }

  
  @Post('auth')
  public async auth(@Body() dto: UsersDTO): Promise<any> {
    return await this.usersService.Auth(dto);
  }

  @Post('register')
  public async create(@Body() dto: UsersDTO): Promise<UsersDTO> {
    return await this.usersService.Register(dto);
  }

  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Body() dto: UsersDTO,
  ): Promise<UsersDTO> {
    return await this.usersService.update(id, dto);
  }

  @Delete(':id')
  public async delete(@Param('id') id: string): Promise<UsersDTO> {
    return await this.usersService.delete(id);
  }
}
