
import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/model/base.entity';


@Entity({ name: 'subscription' })
export class Subscription extends BaseEntity {
    @Column({ type: 'varchar', length: 50 })
    userId: string;
    @Column({ type: 'varchar', length: 50 })
    contractId: string;
    @Column({ type: 'varchar', length: 50 })
    country: string;
    @Column({ type: 'varchar', length: 50 })
    city: string;
    @Column({ type: 'varchar', length: 50 })
    distinct: string;
    @Column({ type: 'varchar', length: 50 })
    street: string;
    @Column({ type: 'varchar', length: 50 })
    postalCode: string;
    @Column({ type: 'varchar', length: 50 })
    coordinates: string;
    @Column({ type: 'varchar', length: 50 })
    detailedAddress: string;
    @Column({ type: 'varchar', length: 50 })
    creatorCompany: string;
    @Column({ type: 'varchar', length: 50 })
    creatorCompanyCode: string;
    @Column({ type: 'varchar', length: 50 })
    creatorStaffName: string;
    @Column({ type: 'varchar', length: 50 })
    simCardNo: string;
    @Column({ type: 'varchar', length: 50 })
    simCardIp: string;
    @Column({ type: 'varchar', length: 50 })
    modemImei: string;
    @Column({  type:"text", array:true})
    sensorIds: string[];
    @Column({ type: 'varchar', length: 50 })
    softwareVersion: string;
    @Column({ type: 'varchar', length: 50 })
    serverIp: string;
    @Column({  type:"text", array:true })
    deliveredProductIDs: string[];
  

  }
  