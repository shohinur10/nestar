import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NonNullTypeNode } from 'graphql';
import { Model } from 'mongoose';
import { Property } from '../../libs/dto/property/property';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';

@Injectable()
export class PropertyService {
    constructor(
        @InjectModel('Property') private readonly propertyModel: Model<Property>,
private memberService: MemberService,
) {} // Inject the property model
    // This service is responsible for handling property-related operations.
    public async createProperty(input: PropertyInput): Promise<Property> {
        console.log('Creating property with input:', input);
      
        if (!input.memberId) {
          throw new BadRequestException('memberId is required for property creation');
        }
      
        try {
          const result = await this.propertyModel.create(input);
          console.log('Property created:', result);
      
          await this.memberService.memberStatsEditor({
            _id: result.memberId,
            targetKey: 'memberProperties',
            modifier: 1,
          });
          return result;
        } catch (err) {
          console.error('Error in createProperty:', err);
          throw new BadRequestException(Message.CREATE_FAILED);
        }
      }
      
    }