import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractType } from 'src/model/users/contractType.entity';
import { Repository } from 'typeorm';
import { ContractTypeDTO } from './contractType.dto';

@Injectable()
export class ContractTypeService {
  constructor(
    @InjectRepository(ContractType)
    private readonly repo: Repository<ContractType>,
  ) {}

  //get all devices locations
  public async getAll(): Promise<ContractTypeDTO[]> {
    return await this.repo
      .find()
      .then((datas) => datas.map((e) => ContractTypeDTO.fromEntity(e)));
  }

  public async get(id: string): Promise<ContractTypeDTO> {
    return await this.repo
      .findOne({ where: { ContentID: id } })
      .then((e) => ContractTypeDTO.fromEntity(e));
  }

  // save new device
  public async create(dto: ContractTypeDTO): Promise<ContractTypeDTO> {
    return await this.repo
      .save(ContractTypeDTO.toEntity(dto))
      .then((e) => ContractTypeDTO.fromEntity(e));
  }

  // update device
  public async update(
    id: string,
    dto: ContractTypeDTO,
  ): Promise<ContractTypeDTO> {
    const newLocal = await this.repo.update(id, dto);
    if (newLocal.affected > 0) {
      const updatedData = ContractTypeDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }

  // update device
  public async delete(id: string): Promise<ContractTypeDTO> {
    const data = await this.repo.findOne({ where: { ContentID: id } });
    const newLocal = await this.repo.update(id, data);
    if (newLocal.affected > 0) {
      data.isDeleted = true;
      const updatedData = ContractTypeDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }
}
