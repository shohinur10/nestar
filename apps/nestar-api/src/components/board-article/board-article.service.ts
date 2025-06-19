import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BoardArticleService {
    constructor(@InjectModel ('BoardArticle') private readonly boardArticleRepository: Model<BoardArticleService>) {}
}

