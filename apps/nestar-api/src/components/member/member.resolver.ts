import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { MemberInput } from '../../libs/dto/member.input';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService) {}// inject the service

    @Mutation(() => String)
    @UsePipes(ValidationPipe) // Use validation pipe for input validation
    public async signup(@Args("input") input: MemberInput): Promise<string> {
        console.log('Member signup called');
        console.log('Input:', input);
        // Implement the signup logic here
        return  this .memberService.signup();
    }
    @Mutation(() => String)
    public async login(@Args("input") input: MemberInput): Promise<string> {
        console.log('Member login called');
        // Implement the login logic here
        return this.memberService.login();
    }
    @Mutation(() => String)
    public async updateMember(): Promise<string> {
        console.log(' Mutation: Member update called');
        // Implement the update logic here
        return this.memberService.updateMember();
    }
    @Query(() => String)
    public async getMember(): Promise<string> {
        console.log('Query : Member get called');
        // Implement the get logic here
        return this.memberService.getMember();
    }
}
