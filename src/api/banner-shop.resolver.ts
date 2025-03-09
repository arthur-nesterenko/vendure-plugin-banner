import { Args, Query, Resolver } from '@nestjs/graphql';
import { Ctx, RelationPaths, Relations, RequestContext } from '@vendure/core';
import { QueryBannerArgs } from '../generated-shop-types';
import { Banner } from '../entities/banner.entity';
import { BannerService } from '../service/banner.service';

@Resolver()
export class BannerShopResolver {
    constructor(private bannerService: BannerService) {}

    @Query()
    async banner(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryBannerArgs,
        @Relations(Banner) relations: RelationPaths<Banner>,
    ) {
        return this.bannerService.findOne(ctx, args.id, relations);
    }

    @Query()
    async bannerByName(
        @Ctx() ctx: RequestContext,
        @Args() args: { name: string },
        @Relations(Banner) relations: RelationPaths<Banner>,
    ) {
        return this.bannerService.findByName(ctx, args.name, relations);
    }
}
