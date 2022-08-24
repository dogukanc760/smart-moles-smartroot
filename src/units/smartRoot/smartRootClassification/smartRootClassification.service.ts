import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SmartRootClassification } from 'src/model/SmartRoot/smartRootClassification.entity';
import { Repository } from 'typeorm';
import { SmartRootClassificationDTO } from './smartRootClassification.dto';


@Injectable()
export class SmartRootClassificationService {
  constructor(
    @InjectRepository(SmartRootClassification)
    private readonly repo: Repository<SmartRootClassification>,
  ) {}

  //get all devices locations
  public async getAll(): Promise<SmartRootClassificationDTO[]> {
    return await this.repo
      .find()
      .then((datas) => datas.map((e) => SmartRootClassificationDTO.fromEntity(e)));
  }

  public async get(id: string): Promise<SmartRootClassificationDTO> {
    return await this.repo
      .findOne({ where: { ContentID: id } })
      .then((e) => SmartRootClassificationDTO.fromEntity(e));
  }

  public async getBySmartRoot(id: string): Promise<SmartRootClassificationDTO[]> {
    return await this.repo
      .find({ where: { SmartRootID: id } })
      .then((datas) => datas.map((e) => SmartRootClassificationDTO.fromEntity(e)));
  }

  // save new device
  public async create(dto: SmartRootClassificationDTO): Promise<SmartRootClassificationDTO> {
    try {
      return await this.repo
      .save(SmartRootClassificationDTO.toEntity(dto))
      .then((e) => SmartRootClassificationDTO.fromEntity(e));
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  // update device
  public async update(id: string, dto: SmartRootClassificationDTO): Promise<SmartRootClassificationDTO> {
    const newLocal = await this.repo.update(id, dto);
    if (newLocal.affected > 0) {
      const updatedData = SmartRootClassificationDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }

  // update device
  public async delete(id: string): Promise<SmartRootClassificationDTO> {
    const data = await this.repo.findOne({ where: { ContentID: id } });
    const newLocal = await this.repo.update(id, data);
    if (newLocal.affected > 0) {
      data.isDeleted = true;
      const updatedData = SmartRootClassificationDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }
}
