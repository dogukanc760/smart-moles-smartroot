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
import { SubscriptionDTO } from './subscription.dto';
import { SubscriptionService } from './subscription.service';
@Controller('subscriptions')
@ApiTags('Subscriptions Endpoints')
@UseInterceptors(TransformInterceptor)
export class SubscriptionsController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get()
  public async getAll(): Promise<SubscriptionDTO[]> {
    return await this.subscriptionService.getAll();
  }

  @Get(':id')
  public async get(@Param('id') id: string): Promise<SubscriptionDTO> {
    return await this.subscriptionService.get(id);
  }

  @Get('/gey-by-user/:id')
  public async getByUser(@Param('id') id: string): Promise<SubscriptionDTO> {
    return await this.subscriptionService.getByUser(id);
  }

  @Get('/gey-by-contract/:id')
  public async getByContract(@Param('id') id: string): Promise<SubscriptionDTO> {
    return await this.subscriptionService.geyByContractId(id);
  }

  @Post()
  public async create(@Body() dto: SubscriptionDTO): Promise<SubscriptionDTO> {
    return await this.subscriptionService.create(dto);
  }

  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Body() dto: SubscriptionDTO,
  ): Promise<SubscriptionDTO> {
    return await this.subscriptionService.update(id, dto);
  }

  @Delete(':id')
  public async delete(@Param('id') id: string): Promise<SubscriptionDTO> {
    return await this.subscriptionService.delete(id);
  }
}
