import { Module } from '@nestjs/common';
import { PropertyResolver } from './property.resolver';
import { PropertyService } from './property.service';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import PropertySchema from '../../schemas/Property.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Property',
         schema: PropertySchema ,
        },
      ]),
         AuthModule,
         ViewModule // Assuming you have a PropertySchema defined
  ],
  providers: [PropertyResolver, PropertyService]
})
export class PropertyModule {}
