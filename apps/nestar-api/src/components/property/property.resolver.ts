import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { PropertyService } from './property.service';
import { Property } from '../../libs/dto/property/property';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';


@Resolver()
export class PropertyResolver {
constructor(private readonly propertyService: PropertyService) {}

@Mutation(()=>Property)
public async createProperty(
 @Args('input') input:PropertyInput, 
@AuthMember("_id") memberId:ObjectId,): Promise<Property> {
    console.log('Mutation: createProperty')
      //input.memberId = memberId;
    // Implement the create property logic here
    return this.propertyService.createProperty(input);

}
}