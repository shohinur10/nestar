import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isNullableType, NonNullTypeNode } from 'graphql';
import { Model, ObjectId, Schema, Types } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import { AgentPropertiesInquiry, PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { T, StatisticModifier } from '../../libs/types/common';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import moment from 'moment';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';

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

    public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
      let { propertyStatus, soldAt, deletedAt } = input;
      const search: T = {
        _id: input._id,// the property belong to our  agent and the change data
        memberId: memberId,
        propertyStatus: PropertyStatus.ACTIVE,
      };
  
      if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
      else if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();
  
      const result = await this.propertyModel
        .findByIdAndUpdate(search, input, {
          new: true,
        })
        .exec();
  
      if (!result) throw new InternalServerErrorException(Message.UPDATED_FAILED);
  
      if (soldAt || deletedAt) {
        await this.memberService.memberStatsEditor({
          _id: memberId,
          targetKey: 'memberProperties',
          modifier: -1,
        });
      }
      return result;
    }

    public async getProperties(memberId: ObjectId, input: PropertiesInquiry): Promise<Properties> {
      const match: T = { propertyStatus: PropertyStatus.ACTIVE };
    
      const sortDirection = input?.direction === Direction.DESC ? -1 : 1;
      const sortField = input?.sort ?? 'createdAt';
      const sort: T = { [sortField]: sortDirection };
    
      this.shapeMatchQuery(match, input);
      console.log('match:', match);
    
      const result = await this.propertyModel
        .aggregate([
          { $match: match },
          { $sort: sort },
          {
            $facet: {
              list: [
                { $skip: (input.page - 1) * input.limit },
                { $limit: input.limit },
                lookupMember,
                { $unwind: '$memberData' },
              ],
              metaCounter: [{ $count: 'total' }],
            },
          },
        ])
        .exec();
    
      if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    
      return result[0];
    }
    

	private shapeMatchQuery(match: T, input: PropertiesInquiry): void {
		const {
			memberId,
			locationList,
			roomsList,
			bedsList,
			typeList,
			periodsRange,
			pricesRange,
			squaresRange,
			options,
			text,
		} = input.search;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (locationList && locationList.length) match.propertyLocation = { $in: locationList };// MongoDb syntax
		if (roomsList && roomsList.length) match.propertyRooms = { $in: roomsList };
		if (bedsList && bedsList.length) match.propertyBeds = { $in: bedsList };
		if (typeList && typeList.length) match.propertyType = { $in: typeList };

		if (pricesRange) match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
		if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
		if (squaresRange) match.propertySquare = { $gte: squaresRange.start, $lte: squaresRange.end };

		if (text) match.propertyTitle = { $regex: new RegExp(text, 'i') };
		if (options) {
			match['$or'] = options.map((ele) => {// at least one should match in order to search 
				return { [ele]: true };
			});
		}
	}

  public async getAgentProperties(memberId: ObjectId, input: AgentPropertiesInquiry): Promise<Properties> {
    const { propertyStatus } = input.search;
    if (propertyStatus === PropertyStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
  
    const match: T = {
      memberId: memberId,
      propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE },
    };
  
    const sortDirection = input?.direction === Direction.DESC ? -1 : 1;
    const sortField = input?.sort ?? 'createdAt';
    const sort: T = { [sortField]: sortDirection };
  
    const result = await this.propertyModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
  
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
  
    return result[0];
  }
  
    
  }