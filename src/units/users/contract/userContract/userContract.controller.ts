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
import { UserContractDTO } from './userContract.dto';
import { UserContractService } from './userContract.service';

  @Controller('user-contracts')
  @ApiTags('User Contracts Endpoints')
  @UseInterceptors(TransformInterceptor)
  export class UserContractsController {
    constructor(private userContractService: UserContractService) {}
  
    @Get()
    public async getAll(): Promise<UserContractDTO[]> {
      return await this.userContractService.getAll();
    }
  
    @Get(':id')
    public async get(@Param('id') id: string): Promise<UserContractDTO> {
      return await this.userContractService.get(id);
    }
  
    @Get('/gey-by-user/:id')
    public async getByUser(@Param('id') id: string): Promise<UserContractDTO> {
      return await this.userContractService.getByUser(id);
    }
  
    @Get('/gey-by-contract/:id')
    public async getByContract(@Param('id') id: string): Promise<UserContractDTO> {
      return await this.userContractService.geyByContractId(id);
    }
  
    @Post()
    public async create(@Body() dto: UserContractDTO): Promise<UserContractDTO> {
      return await this.userContractService.create(dto);
    }
  
    @Put(':id')
    public async update(
      @Param('id') id: string,
      @Body() dto: UserContractDTO,
    ): Promise<UserContractDTO> {
      return await this.userContractService.update(id, dto);
    }
  
    @Delete(':id')
    public async delete(@Param('id') id: string): Promise<UserContractDTO> {
      return await this.userContractService.delete(id);
    }
  }
  