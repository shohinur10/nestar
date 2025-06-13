import{ObjectId} from 'bson';

export const availableAgentSorts =["createdAt", "updateAt", "memberLikes", "memberViews","memberRanking"] ;

export const shapeIntoMongoObjectId= (target: any) =>{
  return typeof target === "string" ? new ObjectId(target) : target;
 }