import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/dto/member';
import { LoginInput, MemberInput } from '../../libs/dto/member.input';
import MemberSchema from '../../schemas/Member.model';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member.update';
@Injectable()
export class MemberService {
    constructor(@InjectModel('Member') private readonly memberModel: Model <Member>,
    private authService:AuthService
) {}

    public async signup(input:MemberInput): Promise<Member> {
   //TODO:HASH PASSWORD
   input.memberPassword = await this.authService.hashPassword(input.memberPassword);

   try{
   const result  = await this.memberModel.create(input);
   //TODO: Authentication logic here
    result.accessToken = await this.authService.createToken(result); // Assuming createToken is a method in AuthService that generates a token for the member
   return result;
    } catch (err){
        console.error('Error, Service.model:', err.message);
        throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE); // Handle the error appropriately

    }
    }
    public async login(input:LoginInput): Promise<Member> {
        const{ memberNick, memberPassword } = input;
        const response = await this.memberModel
        .findOne({
            memberNick: input.memberNick,
        }).select('+memberPassword')
        .exec(); // Ensure password is included in the result

        if (!response) {
            throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
        }
        
        if (!response || response.memberStatus === MemberStatus.DELETED) {
            throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
        }else if (response.memberStatus === MemberStatus.BLOCK) {
            throw new InternalServerErrorException(Message.MEMBER_BLOCKED);
        }
        //TODO:  compare  password verification logic here

        if (!response.memberPassword) {
            throw new InternalServerErrorException(Message.WRONG_PASSWORD);
        }
        const isMatch = await this.authService.comparePassword(input.memberPassword, response.memberPassword); // Replace with actual password comparison logic
        if (!isMatch) 
            throw new InternalServerErrorException(Message.WRONG_PASSWORD);
        // delete response.memberPassword; // Remove password from the response
        response.accessToken = await this.authService.createToken(response); // Assuming createToken is a method in AuthService that generates a token for the member
        return response;
    }
    public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
        const result  = await this.memberModel
            .findOneAndUpdate(
                {
                    _id: memberId,
                    memberStatus: MemberStatus.ACTIVE,
                },
                input,
                { new: true },
            )
            .exec();
        if (!result) throw new InternalServerErrorException(Message.UPDATED_FAILED);
    
        
        result.accessToken = await this.authService.createToken(result);
        return result;
    }
    public async getMember(): Promise<string> {
        return 'Member retrieved successfully';
    }

    public async updateMemberByAdmin(): Promise<string> {
        return 'Member updated by admin successfully';
    }
    public async getAllMembersByAdmin(): Promise<string> {
        return 'All members retrieved successfully';
    }
}

