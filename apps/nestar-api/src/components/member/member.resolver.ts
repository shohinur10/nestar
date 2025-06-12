import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UseGuards, UsePipes,  } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member.input';
import { Member } from '../../libs/dto/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member.update';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService) {}// inject the service

    @Mutation(() => Member) // Use validation pipe for input validation
    public async signup(@Args("input") input: MemberInput): Promise<Member> {
        console.log('Mutation: signup');
         // Implement the signup logic here
        return  this.memberService.signup(input);
    }
    @Mutation(() => Member)
    public async login(@Args("input") input: LoginInput): Promise<Member> {
        console.log('Mutation: login');
     
        return this.memberService.login(input);
    }
    // Authenticated : (user ,admin ,agent )
    @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async updateMember(
         @Args('input') input: MemberUpdate,
        @AuthMember('_id') memberId: ObjectId):
         Promise<Member> {
        console.log(' Mutation: update ');

       delete input._id  // Remove _id from input if not needed
        
        // Implement the update logic here
        return this.memberService.updateMember(memberId, input);
    }
    @UseGuards(AuthGuard)
    @Query(() => String)
    public async checkAuth(@AuthMember('memberNick') memberNick: string ): Promise<string> {
        console.log(' checkAuth: update ');
        console.log( 'memberNick:', memberNick);
        // Implement the update logic here
        return `Hi${memberNick}`;
    }

    @Roles(MemberType.USER, MemberType.AGENT) // Allow USER, ADMIN, AGENT roles
    @UseGuards(RolesGuard)
    @Query(() => String)
    public async checkAuthRoles(@AuthMember() authMember: Member ): Promise<string> {
        console.log(' checkAuth: update ');
        console.log( 'authMember:', authMember.memberNick);
        // Implement the update logic here
        return `Hi${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
    }

     @UseGuards(WithoutGuard)
    @Query(() => Member)
    public async getMember(@Args('memberId') input: string,@AuthMember('_id') memberId:ObjectId): Promise<Member> {
        console.log('Query :  getMember ');
        console.log('memberId:', memberId);
        const targetId = shapeIntoMongoObjectId(input);
        // Implement the get logic here
        return this.memberService.getMember(targetId, memberId);
    }
    //Authorization :Admin 
    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => String)
    public async getAllMembersByAdmin(@AuthMember() authMember:Member): Promise<string> {
        console.log('Mutation: getAllMembers:',authMember.memberType)
        // Implement the logic to get all members here
        return this.memberService.getAllMembersByAdmin();
    }

    @Mutation(() => String)
    public async updateMemberByAdmin(): Promise<string> {
        console.log('Mutation: updateMemberByAdmin');
        // Implement the admin update logic here
        return this.memberService.updateMemberByAdmin();
    }
}
