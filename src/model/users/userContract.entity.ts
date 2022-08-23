import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/model/base.entity';

@Entity({ name: 'userContract' })
export class UserContract extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  UserID: string;
  @Column({ type: 'varchar', length: 150 })
  ContractID: string;
  @Column({ type: 'varchar', length: 150 })
  ContractTypeID: string;
  @Column({ type: 'varchar', length: 150 })
  ContractName: string;
  
}
