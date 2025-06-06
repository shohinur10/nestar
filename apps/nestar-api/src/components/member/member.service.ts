import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member';
import { LoginInput, MemberInput } from '../../libs/dto/member.input';
import MemberSchema from '../../schemas/Member.model';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';
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
    public async login(input:LoginInput): Promise<Member> {
        const{ memberNick, memberPassword } = input;
        const response = await this.memberModel.findOne({
            memberNick: input.memberNick,
        }).select('+memberPassword').exec();// Ensure password is included in the result
        if (!response || response.memberStatus === MemberStatus.DELETED) {
            throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
        }else if (response.memberStatus === MemberStatus.BLOCK) {
            throw new InternalServerErrorException(Message.MEMBER_BLOCKED);
        }
        //TODO:  compare  password verification logic here
        const isMatch =memberPassword === response.memberPassword; // Replace with actual password comparison logic
        if (!isMatch) 
            throw new InternalServerErrorException(Message.WRONG_PASSWORD);
        return response;
    }
    public async updateMember(): Promise<string> {
        return 'Member updated successfully';
    }
    public async getMember(): Promise<string> {
        return 'Member retrieved successfully';
    }
}

