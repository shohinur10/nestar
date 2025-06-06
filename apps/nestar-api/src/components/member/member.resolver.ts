import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member.input';
import { Member } from '../../libs/dto/member';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService) {}// inject the service

    @Mutation(() => Member)
    @UsePipes(ValidationPipe) // Use validation pipe for input validation
    public async signup(@Args("input") input: MemberInput): Promise<Member> {
        try{
        console.log('Member signup called');
        console.log('Input:', input);
        // Implement the signup logic here
        return  this.memberService.signup(input);
        } catch (err) {
            console.error('Error during signup:', err);
            throw new InternalServerErrorException(err); // Rethrow the error to be handled by the global exception filter
        }
    }
    @Mutation(() => Member)
    public async login(@Args("input") input: LoginInput): Promise<Member> {
        console.log('Member login called');
        // Implement the login logic here
        return this.memberService.login(input);
        try{
            console.log('Member login called');
            // Implement the login logic here
            return this.memberService.login(input);
            } catch (err) {
                console.error('Error during signup:', err);
                throw new InternalServerErrorException(err); // Rethrow the error to be handled by the global exception filter
         }
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
