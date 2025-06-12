import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';

@Injectable()
export class ViewService {
  
    constructor(@InjectModel("View") private readonly viewModel: Model<View>) {} // Inject the View modeel
    
    public async recordView(input: ViewInput): Promise<boolean> {
        const viewExist = await this.checkViewExistence(input);
        if (!viewExist) {
          console.log("-New View Insert -");
          await this.viewModel.create(input);
          return true; // ✅ New view was inserted
        }
        return false; // ❌ Already exists, not new
      }
      
      

      private async checkViewExistence(input: ViewInput): Promise<View | null> {
        const { memberId, viewRefId } = input;
        const result = await this.viewModel.findOne({ memberId, viewRefId }).exec();
        return result; // ✅ No more error throwing
      }
      
    }      