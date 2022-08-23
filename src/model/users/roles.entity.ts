import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity({ name: 'roles' })
export class Roles extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  RoleName: string;
  @Column({ type: 'varchar', length: 50 })
  RoleDescription: string;
  
}
