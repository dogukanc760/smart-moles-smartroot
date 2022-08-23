import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserContract } from 'src/model/users/userContract.entity';
import { Repository } from 'typeorm';
import { UserContractDTO } from './userContract.dto';

@Injectable()
export class UserContractService {
  constructor(
    @InjectRepository(UserContract)
    private readonly repo: Repository<UserContract>,
  ) {}

  //get all devices locations
  public async getAll(): Promise<UserContractDTO[]> {
    return await this.repo
      .find()
      .then((datas) => datas.map((e) => UserContractDTO.fromEntity(e)));
  }

  public async get(id: string): Promise<UserContractDTO> {
    return await this.repo
      .findOne({ where: { ContentID: id } })
      .then((e) => UserContractDTO.fromEntity(e));
  }

  public async getByUser(id: string): Promise<UserContractDTO> {
    return await this.repo
    .findOne({ where: { UserID: id } })
    .then((e) => UserContractDTO.fromEntity(e));
  }

  public async geyByContractId(id: string): Promise<UserContractDTO> {
    return await this.repo
    .findOne({ where: { ContractID: id } })
    .then((e) => UserContractDTO.fromEntity(e));
  }


  // save new device
  public async create(dto: UserContractDTO): Promise<UserContractDTO> {
    return await this.repo
      .save(UserContractDTO.toEntity(dto))
      .then((e) => UserContractDTO.fromEntity(e));
  }

  // update device
  public async update(
    id: string,
    dto: UserContractDTO,
  ): Promise<UserContractDTO> {
    const newLocal = await this.repo.update(id, dto);
    if (newLocal.affected > 0) {
      const updatedData = UserContractDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }

  // update device
  public async delete(id: string): Promise<UserContractDTO> {
    const data = await this.repo.findOne({ where: { ContentID: id } });
    const newLocal = await this.repo.update(id, data);
    if (newLocal.affected > 0) {
      data.isDeleted = true;
      const updatedData = UserContractDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }
}
