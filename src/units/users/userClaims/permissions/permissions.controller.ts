import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/libs/api-results/standart-results';
import { PermissionsDTO } from './permissions.dto';
import { PermissionsService } from './permissions.service';
@Controller('permissions')
@ApiTags('Permissions Endpoints')
@UseInterceptors(TransformInterceptor)
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  public async getAll(): Promise<PermissionsDTO[]> {
    return await this.permissionsService.getAll();
  }

  @Get(':id')
  public async get(@Param('id') id: string): Promise<PermissionsDTO> {
    return await this.permissionsService.get(id);
  }

  @Get('/gey-by-user/:id')
  public async getByRole(@Param('id') id: string): Promise<PermissionsDTO> {
    return await this.permissionsService.getByRole(id);
  }

  @Post()
  public async create(@Body() dto: PermissionsDTO): Promise<PermissionsDTO> {
    return await this.permissionsService.create(dto);
  }

  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Body() dto: PermissionsDTO,
  ): Promise<PermissionsDTO> {
    return await this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  public async delete(@Param('id') id: string): Promise<PermissionsDTO> {
    return await this.permissionsService.delete(id);
  }
}
