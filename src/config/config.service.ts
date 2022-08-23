import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

require('dotenv').config();

export class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }
  
  //"pretypeorm": "(del ormconfig.json || :) && ts-node -r tsconfig-paths/register src/scripts/write-type-orm-config.ts",
  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      host: 'smartmoles-db.c2u5sdrstqo9.us-east-2.rds.amazonaws.com',//this.getValue('POSTGRES_HOST'),
      port: 5432,//parseInt(this.getValue('POSTGRES_PORT')),
      username: 'post_sm_gres',//this.getValue('POSTGRES_USER'),
      password: '$myPassword=5MaRt*M0L+2512',//this.getValue('POSTGRES_PASSWORD'),
      database: 'SMUnitWork',//this.getValue('POSTGRES_DATABASE'),


      // host: this.getValue('POSTGRES_HOST'),
      // port: 5432,//parseInt(this.getValue('POSTGRES_PORT')),
      // username: this.getValue('POSTGRES_USER'),
      // password: this.getValue('POSTGRES_PASSWORD'),
      // database: this.getValue('POSTGRES_DATABASE'),
      synchronize: true,
      entities: ['dist/**/*.entity{*.ts,*.js}'],

      migrationsTableName: 'migrations',

      migrations: ['src/migrations/*.ts'],
      
        // cli: {
        //   migrationsDir: 'src/migrations',
        // },

      ssl: false, //this.isProduction(),
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

export { configService };
