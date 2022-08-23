import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/model/users/users.entity';
import { Repository } from 'typeorm';
import { UsersDTO } from './users.dto';
import { LoginUsersDTO } from './users.login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { resourceLimits } from 'worker_threads';
import { AuthGuard } from '@nestjs/passport';
import datasource from 'src/config/migration.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly repo: Repository<Users>,
    private jwtService: JwtService,
  ) {}

  public async Auth(dto: LoginUsersDTO): Promise<any> {
    const saltOrRounds = 10;

    console.log(dto.Mail);
    const user = await this.repo
      .findOne({ where: { Mail: dto.Mail.toString() } })
      .then((datas) => LoginUsersDTO.fromEntity(datas));

    const isMatch = await bcrypt.compare(dto.Password, user.Password);

    if (user && isMatch) {
      const findUser = await this.repo
        .findOne({ where: { Mail: dto.Mail.toString() } })
        .then((datas) => UsersDTO.fromEntity(datas));
      const payload = { user: findUser };

      return {
        access_token: this.jwtService.sign(payload),
        user: findUser,
      };
    }

    throw new UnauthorizedException();
  }

  public async Register(dto: UsersDTO): Promise<UsersDTO> {
    try {
      const user = await this.repo
        .createQueryBuilder('users')
        .select('COUNT (*)', 'count')
        .where('users.Mail = :name', { name: `${dto.Mail}` })
        .getCount();

      if (user > 0) {
        throw new BadRequestException(
          dto.Mail,
          'This user is already registered',
        );
      } else {
        dto.Password = await bcrypt.hash(dto.Password, 5);

        return await this.repo
          .save(UsersDTO.toEntity(dto))
          .then((e) => UsersDTO.fromEntity(e));
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  //get all devices locations

  public async getAll(): Promise<UsersDTO[]> {
    return await this.repo
      .find()
      .then((datas) => datas.map((e) => UsersDTO.fromEntity(e)));
  }

  public async get(id: string): Promise<UsersDTO> {
    return await this.repo
      .findOne({ where: { ContentID: id } })
      .then((e) => UsersDTO.fromEntity(e));
  }

  public async getByUserType(id: string): Promise<UsersDTO[]> {
    return await this.repo
      .find({ where: { UserType: id } })
      .then((datas) => datas.map((e) => UsersDTO.fromEntity(e)));
  }

  public async getByCountry(id: string): Promise<UsersDTO[]> {
    return await this.repo
      .find({ where: { Country: id } })
      .then((datas) => datas.map((e) => UsersDTO.fromEntity(e)));
  }

  public async getByVerified(id: boolean): Promise<UsersDTO[]> {
    return await this.repo
      .find({ where: { MailIsVerified: id } })
      .then((datas) => datas.map((e) => UsersDTO.fromEntity(e)));
  }

  //   public async getByName(name: string): Promise<UsersDTO[]> {
  //     return await this.repo
  //       .createQueryBuilder('gateway')
  //       .where('gateway.Name like :name', { name: `%${name}%` })
  //       .getMany()
  //       .then((datas) => datas.map((e) => UsersDTO.fromEntity(e)));
  //   }

  // save new device
  public async create(dto: UsersDTO): Promise<UsersDTO> {
    return await this.repo
      .save(UsersDTO.toEntity(dto))
      .then((e) => UsersDTO.fromEntity(e));
  }

  // update device
  public async update(id: string, dto: UsersDTO): Promise<UsersDTO> {
    const newLocal = await this.repo.update(id, dto);
    if (newLocal.affected > 0) {
      const updatedData = UsersDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }

  // update device
  public async delete(id: string): Promise<UsersDTO> {
    const data = await this.repo.findOne({ where: { ContentID: id } });
    const newLocal = await this.repo.update(id, data);
    if (newLocal.affected > 0) {
      data.isDeleted = true;
      const updatedData = UsersDTO.fromEntity(
        await this.repo.findOne({ where: { ContentID: id } }),
      );
      return updatedData;
    }

    throw new HttpException('Error updating device', 500);
  }
}
