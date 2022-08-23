import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permissions } from 'src/model/users/permissions.entity';
import { Repository } from 'typeorm';
import { PermissionsDTO } from './permissions.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permissions)
    private readonly repo: Repository<Permissions>,
  ) {}

  //get all devices locations
  public async getAll(): Promise<PermissionsDTO[]> {
    return await this.repo
      .find()
      .then((datas) => datas.map((e) => PermissionsDTO.fromEntity(e)));
  }

  public async get(id: string): Promise<PermissionsDTO> {
    return await this.repo
      .findOne({ where: { ContentID: id } })
      .then((e) => PermissionsDTO.fromEntity(e));
  }

  public async getByRole(id: string): Promise<PermissionsDTO> {
    return await this.repo
      .findOne({ where: { RoleID: id } })
      .then((e) => PermissionsDTO.fromEntity(e));
  }

  // save new device
  public async create(dto: PermissionsDTO): Promise<PermissionsDTO> {
    return await this.repo
      .save(PermissionsDTO.toEntity(dto))
      .then((e) => PermissionsDTO.fromEntity(e));
  }

  // update device
  public async update(
    id: string,
    dto: PermissionsDTO,
  ): Promise<PermissionsDTO> {
    const newLocal = await this.repo.update(id, dto);
    if (newLocal.affected > 0) {
      const updatedData = PermissionsDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }

  // update device
  public async delete(id: string): Promise<PermissionsDTO> {
    const data = await this.repo.findOne({ where: { ContentID: id } });
    const newLocal = await this.repo.update(id, data);
    if (newLocal.affected > 0) {
      data.isDeleted = true;
      const updatedData = PermissionsDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }
}
