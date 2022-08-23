import { UsersDTO } from 'src/units/users/users.dto';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity({ name: 'users' })
export class Users extends BaseEntity {
  map(arg0: UsersDTO): any {
    throw new Error('Method not implemented.');
  }
  @Column({ type: 'varchar', length: 50 })
  RoleID: string;
  @Column({ type: 'varchar', length: 50 })
  Name: string;
  @Column({ type: 'varchar', length: 50 })
  Surname: string;
  @Column({ type: 'varchar', length: 50 })
  Mail: string;
  @Column({ type: 'varchar', length: 350 })
  Password: string;
  @Column({ type: 'varchar', length: 50 })
  Gsm: string;
  @Column({ type: 'varchar', length: 50 })
  CitizenShipNum: string;
  @Column({ type: 'varchar', length: 50 })
  Nationality: string;
  @Column({ type: 'varchar', length: 50 })
  CompanyName: string;
  @Column({ type: 'varchar', length: 50 })
  TaxNum: string;
  @Column({ type: 'varchar', length: 50 })
  MersisNo: string;
  @Column({ type: 'varchar', length: 250 })
  Address: string;
  @Column({ type: 'boolean', default: false })
  MailIsVerified: boolean;
  @Column({ type: 'timestamptz'})
  MailVerifiedAt: Date;
  @Column({ type: 'varchar', length: 50 })
  Country: string;
  @Column({ type: 'varchar', length: 50 })
  City: string;
  @Column({ type: 'varchar', length: 50 })
  Distinct: string;
  @Column({ type: 'varchar', length: 250 })
  DetailAddress: string;
  @Column({ type: 'varchar', length: 50 })
  PostalCode: string;
  @Column({ type: 'varchar', length: 50 })
  Phone: string;
  @Column({ type: 'varchar', length: 50 })
  CompanyPhone: string;
  @Column({ type: 'varchar', length: 50 })
  HomePhone: string;
  @Column({ type: 'varchar', length: 50 })
  UserType: string;
  @Column({ type: 'boolean', default: false})
  IsAdmin: boolean;
  @Column({ type: 'boolean', default: false})
  IsBusiness: boolean;
}
