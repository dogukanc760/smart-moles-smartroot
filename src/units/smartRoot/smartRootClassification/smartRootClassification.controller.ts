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
import { SmartRootClassificationDTO } from './smartRootClassification.dto';
import { SmartRootClassificationService } from './smartRootClassification.service';

 
  
  @Controller('smart-root-classification')
  @ApiTags('Smart Root Classification Second Endpoints')
  @UseInterceptors(TransformInterceptor)
  export class SmartRootClassificationController {
    constructor(private smartRootClassificationService: SmartRootClassificationService) {}
  
    @Get()
    public async getAll(): Promise<SmartRootClassificationDTO[]> {
      return await this.smartRootClassificationService.getAll();
    }
  
    @Get(':id')
    public async get(@Param('id') id: string): Promise<SmartRootClassificationDTO> {
      return await this.smartRootClassificationService.get(id);
    }
  
    @Get('/get-by-smartroot/:id')
    public async getBySmartRoot(@Param('id') id: string): Promise<SmartRootClassificationDTO[]> {
      return await this.smartRootClassificationService.getBySmartRoot(id);
    }
  
    
  
    @Post()
    public async create(@Body() dto: SmartRootClassificationDTO): Promise<SmartRootClassificationDTO> {
      return await this.smartRootClassificationService.create(dto);
    }
  
    @Put(':id')
    public async update(
      @Param('id') id: string,
      @Body() dto: SmartRootClassificationDTO,
    ): Promise<SmartRootClassificationDTO> {
      return await this.smartRootClassificationService.update(id, dto);
    }
  
    @Delete(':id')
    public async delete(@Param('id') id: string): Promise<SmartRootClassificationDTO> {
      return await this.smartRootClassificationService.delete(id);
    }
  }
  