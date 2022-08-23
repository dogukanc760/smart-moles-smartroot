import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from 'src/model/users/roles.entity';
import { Repository } from 'typeorm';
import { RolesDTO } from './roles.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly repo: Repository<Roles>,
  ) {}

  //get all devices locations
  public async getAll(): Promise<RolesDTO[]> {
    return await this.repo
      .find()
      .then((datas) => datas.map((e) => RolesDTO.fromEntity(e)));
  }

  public async get(id: string): Promise<RolesDTO> {
    return await this.repo
      .findOne({ where: { ContentID: id } })
      .then((e) => RolesDTO.fromEntity(e));
  }


  // save new device
  public async create(dto: RolesDTO): Promise<RolesDTO> {
    return await this.repo
      .save(RolesDTO.toEntity(dto))
      .then((e) => RolesDTO.fromEntity(e));
  }

  // update device
  public async update(
    id: string,
    dto: RolesDTO,
  ): Promise<RolesDTO> {
    const newLocal = await this.repo.update(id, dto);
    if (newLocal.affected > 0) {
      const updatedData = RolesDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }

  // update device
  public async delete(id: string): Promise<RolesDTO> {
    const data = await this.repo.findOne({ where: { ContentID: id } });
    const newLocal = await this.repo.update(id, data);
    if (newLocal.affected > 0) {
      data.isDeleted = true;
      const updatedData = RolesDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }
}
