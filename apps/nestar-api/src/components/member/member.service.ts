import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member';
import { MemberInput } from '../../libs/dto/member.input';
@Injectable()
export class MemberService {
    constructor(@InjectModel('Member') private readonly memberModel: Model <Member>) {}

    public async signup(input:MemberInput): Promise<Member> {
   //TODO:HASH PASSWORD
   try{
   const result  =await this.memberModel.create(input);
   //TODO: Authentication logic here
        return result;
    } catch (err){
        console.error('Error during signup:', err);
        throw new BadRequestException(err); // Handle the error appropriately

    }
    }
    public async login(input:MemberInput): Promise<Member> {
        const result = await this.memberModel.findOne({
            memberNick: input.memberNick,
            memberPassword: input.memberPassword,
        });
        if (!result) {
            throw new BadRequestException('Invalid credentials');
        }

        return result;
    }
    public async updateMember(): Promise<string> {
        return 'Member updated successfully';
    }
    public async getMember(): Promise<string> {
        return 'Member retrieved successfully';
    }
}

