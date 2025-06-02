import { Module } from '@nestjs/common';
import{ MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory:() =>({
                uri:process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : process.env.MONGODB_URI_DEV,
            })
        })
    ],
    exports: [MongooseModule],
})
export class DatabaseModule {
    constructor(@InjectConnection()private readonly connection:Connection) {
        if (connection.readyState === 1){
            console.log(`MongoDb is connected into ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'} mode`);
        }else{
            console.log('Db is not connected!')
        }
    }
}

