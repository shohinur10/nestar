import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { PropertyService } from './property.service';
import { Property } from '../../libs/dto/property/property';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Query } from '@nestjs/graphql';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { UseGuards } from '@nestjs/common';


@Resolver()
export class PropertyResolver {
constructor(private readonly propertyService: PropertyService) {}

@Mutation(()=>Property)
public async createProperty(
 @Args('input') input:PropertyInput, 
@AuthMember("_id") memberId:ObjectId,): Promise<Property> {
    console.log('Mutation: createProperty')
     // input.memberId = memberId;
    // Implement the create property logic here
    return this.propertyService.createProperty(input);

}
@UseGuards(WithoutGuard)
@Query(() => Property)
public async getProperty(
    @Args('propertyId') input: string,
    @AuthMember("_id") memberId: ObjectId,
): Promise<Property> {
    console.log('Query: getProperty');
    const propertyId = shapeIntoMongoObjectId(input); // Make sure it returns ObjectId
    return await this.propertyService.getProperty(memberId, propertyId);
}

}