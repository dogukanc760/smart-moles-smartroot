import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from 'src/model/users/subscription.entity';
import { SubscriptionsController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';



@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  providers: [SubscriptionService],
  controllers: [SubscriptionsController],
  exports: [],
})
export class SubscriptionModule {}
