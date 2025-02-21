import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset, AssetDocument } from './schemas/asset.schema';

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
  ) {}

  async create(createAssetDto: Partial<Asset>): Promise<Asset> {
    const createdAsset = new this.assetModel(createAssetDto);
    return createdAsset.save();
  }

  async findAll(): Promise<Asset[]> {
    return this.assetModel.find().exec();
  }
}