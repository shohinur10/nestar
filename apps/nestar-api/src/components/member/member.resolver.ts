import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UseGuards, UsePipes,  } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member.input';
import { Member } from '../../libs/dto/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';

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
    @Mutation(() => String)
    public async updateMember(@AuthMember('_id') memberId: string ): Promise<string> {
        console.log(' Mutation: update ');
        console.log( typeof memberId);
        console.log(memberId);
        // Implement the update logic here
        return this.memberService.updateMember();
    }
    @UseGuards(AuthGuard)
    @Mutation(() => String)
    public async checkAuth(@AuthMember('memberNick') memberNick: string ): Promise<string> {
        console.log(' Mutation: update ');
        console.log( 'memberNick:', memberNick);
        // Implement the update logic here
        return `Hi${memberNick}`;
    }

    @Query(() => String)
    public async getMember(): Promise<string> {
        console.log('Query :  getMember ');
        // Implement the get logic here
        return this.memberService.getMember();
    }
    //Authorization :Admin 
    @Mutation(() => String)
    public async updateMemberByAdmin(): Promise<string> {
        console.log('Mutation: updateMemberByAdmin');
        // Implement the admin update logic here
        return this.memberService.updateMemberByAdmin();
    }
}
