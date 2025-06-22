import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class LikeService {
    constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}
 
    public async toggleLike(input:LikeInput): Promise<number>{

        console.log("Executed");
        const search: T ={memberId:input.memberId, likerRefId:input.likeRefId},
        exist = await this.likeModel.findOne(search).exec();
        let modifier =1;
        if(exist){
            await this.likeModel.findOne(search).exec();
            modifier =-1;
        } else{
        try{
            await this.likeModel.create(input);
          } catch(err) {
            console.log("Error, Service.model:", err.message);
            throw new BadGatewayException(Message.CREATE_FAILED);
        }
        }    
        return modifier;
    }
}
