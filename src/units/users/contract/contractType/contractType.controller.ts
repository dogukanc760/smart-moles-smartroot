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
import { ContractTypeDTO } from './contractType.dto';
import { ContractTypeService } from './contractType.service';

@Controller('contract-types')
@ApiTags('Contract Types Endpoints')
@UseInterceptors(TransformInterceptor)
export class ContractTypesController {
  constructor(private contractTypesService: ContractTypeService) {}

  @Get()
  public async getAll(): Promise<ContractTypeDTO[]> {
    return await this.contractTypesService.getAll();
  }

  @Get(':id')
  public async get(@Param('id') id: string): Promise<ContractTypeDTO> {
    return await this.contractTypesService.get(id);
  }

  @Post()
  public async create(@Body() dto: ContractTypeDTO): Promise<ContractTypeDTO> {
    return await this.contractTypesService.create(dto);
  }

  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Body() dto: ContractTypeDTO,
  ): Promise<ContractTypeDTO> {
    return await this.contractTypesService.update(id, dto);
  }

  @Delete(':id')
  public async delete(@Param('id') id: string): Promise<ContractTypeDTO> {
    return await this.contractTypesService.delete(id);
  }
}
