import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from 'src/model/users/subscription.entity';
import { Repository } from 'typeorm';
import { SubscriptionDTO } from './subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly repo: Repository<Subscription>,
  ) {}

  //get all devices locations
  public async getAll(): Promise<SubscriptionDTO[]> {
    return await this.repo
      .find()
      .then((datas) => datas.map((e) => SubscriptionDTO.fromEntity(e)));
  }

  public async get(id: string): Promise<SubscriptionDTO> {
    return await this.repo
      .findOne({ where: { ContentID: id } })
      .then((e) => SubscriptionDTO.fromEntity(e));
  }

  public async getByUser(id: string): Promise<SubscriptionDTO> {
    return await this.repo
    .findOne({ where: { userId: id } })
    .then((e) => SubscriptionDTO.fromEntity(e));
  }

  public async geyByContractId(id: string): Promise<SubscriptionDTO> {
    return await this.repo
    .findOne({ where: { contractId: id } })
    .then((e) => SubscriptionDTO.fromEntity(e));
  }


  // save new device
  public async create(dto: SubscriptionDTO): Promise<SubscriptionDTO> {
    return await this.repo
      .save(SubscriptionDTO.toEntity(dto))
      .then((e) => SubscriptionDTO.fromEntity(e));
  }

  // update device
  public async update(
    id: string,
    dto: SubscriptionDTO,
  ): Promise<SubscriptionDTO> {
    const newLocal = await this.repo.update(id, dto);
    if (newLocal.affected > 0) {
      const updatedData = SubscriptionDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }

  // update device
  public async delete(id: string): Promise<SubscriptionDTO> {
    const data = await this.repo.findOne({ where: { ContentID: id } });
    const newLocal = await this.repo.update(id, data);
    if (newLocal.affected > 0) {
      data.isDeleted = true;
      const updatedData = SubscriptionDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }
}
