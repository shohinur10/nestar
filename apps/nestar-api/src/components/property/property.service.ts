import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isNullableType, NonNullTypeNode } from 'graphql';
import { Model, ObjectId, Schema, Types } from 'mongoose';
import { Property } from '../../libs/dto/property/property';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { T, StatisticModifier } from '../../libs/types/common';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import moment from 'moment';

@Injectable()
export class PropertyService {
  [x: string]: any;
    constructor(
        @InjectModel('Property') private readonly propertyModel: Model<Property>,
private memberService: MemberService,
private readonly viewService: ViewService,

) {} // Inject the property model
    // This service is responsible for handling property-related operations.
    public async createProperty(input: PropertyInput): Promise<Property> {
      try {
        const result = await this.propertyModel.create(input);
        await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberProperties', modifier: 1 });
        return result;
      } catch (err) {
        console.log('Error, Service.model:', err.message);
        throw new BadRequestException(Message.CREATE_FAILED);
      }
    }
  
    
      public async getProperty(memberId: ObjectId , propertyId:ObjectId): Promise<Property>{
        const search: T ={
          _id:propertyId,
          propertyStatus: PropertyStatus.ACTIVE
        };
        const targetProperty = await this.propertyModel.findOne(search).lean().exec();//lean modify
        if (!targetProperty) {
          throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        }
        if(!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        if (memberId){
          const ViewInput ={memberId: memberId, viewRefId:propertyId, viewGroup:ViewGroup.PROPERTY}
          const newView =await this.viewService.recordView(ViewInput);

        if (newView){
          await this.propertyStatsEditor({_id:propertyId,targetKey:'propertyViews',modifier:1})};
      targetProperty.propertyViews++;
    }
    targetProperty.memberData = await this.memberService.getMember(null, targetProperty.memberId) as any;
    return targetProperty;
  }

    
    public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
      const { _id, targetKey, modifier } = input;
      const updatedProperty = await this.propertyModel
        .findByIdAndUpdate(
          _id,
          { $inc: { [targetKey]: modifier } },
          {
            new: true,
          }
        )
        .exec();

      if (!updatedProperty) {
        throw new InternalServerErrorException(Message.UPDATED_FAILED);
      }

      return updatedProperty;
    }

    public async updateProperty(memberId:ObjectId, input:PropertyUpdate):Promise<Property>{
      let { propertyStatus ,soldAt, deletedAt }= input;
      const search: T = {
        _id:input._id,
        memberId:memberId, // bu agent memberId tekshiradi boshqa property update qilolmasligi uchun 
        propertyStatus: PropertyStatus.ACTIVE
      };
      console.log('Search query:', search);
      console.log('Input ID:', input._id.toString());
      console.log('Auth memberId:', memberId.toString());
      
      if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
      else if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();
    

      const result = await this.propertyModel
      .findOneAndUpdate(search,input,{
        new: true,
      })
      .exec();
      if (!result) throw new InternalServerErrorException(Message.UPDATED_FAILED);



      if(soldAt || deletedAt){
        await this.memberStatsEditor({
          _Id:memberId,
          targetKey:"memberProperties",
          modifier:-1,
        })
      }
    return result;
    }
    
  }