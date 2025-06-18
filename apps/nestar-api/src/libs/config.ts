import{ObjectId} from 'bson';

export const availableAgentSorts =["createdAt", "updateAt", "memberLikes", "memberViews","memberRanking"] ;
export const availableMemberSorts =["createdAt", "updateAt", "memberLikes", "memberViews"];

export const availableOptions =['propertyBarter','propertyRent'];
export const availablePropertySorts =[
	"createdAt",
	"updateAt",
	'propertyLikes',
	'propertyViews',
	'propertyRank',
	'propertyPrice',
]

/** IMAGE CONFIGURATION */

import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId= (target: any) => {
  return typeof target === "string" ? new ObjectId(target) : target;
 };

 export const lookupMember ={
	$lookup:{
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};