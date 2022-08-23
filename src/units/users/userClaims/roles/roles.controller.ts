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
import { RolesDTO } from './roles.dto';
import { RolesService } from './roles.service';

  @Controller('roles')
  @ApiTags('Roles Endpoints')
  @UseInterceptors(TransformInterceptor)
  export class RolesController {
    constructor(private rolesService: RolesService) {}
  
    @Get()
    public async getAll(): Promise<RolesDTO[]> {
      return await this.rolesService.getAll();
    }
  
    @Get(':id')
    public async get(@Param('id') id: string): Promise<RolesDTO> {
      return await this.rolesService.get(id);
    }
  

    @Post()
    public async create(@Body() dto: RolesDTO): Promise<RolesDTO> {
      return await this.rolesService.create(dto);
    }
  
    @Put(':id')
    public async update(
      @Param('id') id: string,
      @Body() dto: RolesDTO,
    ): Promise<RolesDTO> {
      return await this.rolesService.update(id, dto);
    }
  
    @Delete(':id')
    public async delete(@Param('id') id: string): Promise<RolesDTO> {
      return await this.rolesService.delete(id);
    }
  }
  