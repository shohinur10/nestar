import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class MemberService {
    constructor(@InjectModel('Member') private readonly memberModel: Model <null>) {}

    public async signup(): Promise<string> {
        return 'Member signed up successfully';
    }
    public async login(): Promise<string> {
        return 'Member logged in successfully';
    }
    public async updateMember(): Promise<string> {
        return 'Member updated successfully';
    }
    public async getMember(): Promise<string> {
        return 'Member retrieved successfully';
    }
}

