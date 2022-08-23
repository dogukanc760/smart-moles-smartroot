import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity({ name: 'permissions' })
export class Permissions extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  RoleID: string;
  @Column({ type: 'varchar', length: 50 })
  PermissionName: string;
  @Column({ type: 'varchar', length: 50 })
  PermissionDescription: string;
  @Column({ type: 'varchar', length: 50 })
  PermissionEvent: string;
}
