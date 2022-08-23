import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/model/base.entity';

@Entity({ name: 'contractType' })
export class ContractType extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  name: string;
  @Column({ type: 'varchar', length: 150 })
  title: string;
  @Column({ type: 'varchar', length: 150 })
  subMainTitle: string;
  @Column({ type: 'varchar', length: 150 })
  subContTitle: string;
  @Column({ type: 'varchar', length: 150 })
  description: string;
  @Column({ type: 'varchar', length: 150 })
  mainDescription: string;
  @Column({ type: 'varchar', length: 250 })
  content: string;
  @Column({ type: 'varchar', length: 250 })
  mainContent: string;
  @Column({ type: 'varchar', length: 250 })
  subContent: string;
  @Column({ type: 'varchar', length: 150 })
  altText: string;
  @Column({ type: 'varchar', length: 150 })
  altMainText: string;
  @Column({ type: 'varchar', length: 250 })
  altContentText: string;
  @Column({ type: 'varchar', length: 150 })
  contractTime: string;
}
