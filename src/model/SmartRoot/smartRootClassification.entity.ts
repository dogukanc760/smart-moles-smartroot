import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';

@Entity({ name: 'smartRootClassification' })
export class SmartRootClassification extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  SmartRootID: string;
  @Column({ type: 'varchar', length: 50 })
  GatewayID: string;
  @Column({ type: 'text', array: true })
  Sensors: string[];
  @Column({ type: 'text', array: true })
  SensorDatas: string[];
  // Burada ki classlar şöyle ki:
  // 1- En az kök seviyesi
  // 2- Az Kök Seviyesi
  // 3- Ortalama Kök seviyesi
  // 4- Çok Kök Seviyesi
  // 5- En Çok Kök Seviyesi
  @Column({ type: 'text', array: true })
  SensorClasses: string[];
}
