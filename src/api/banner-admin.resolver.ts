import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Allow, Ctx, RelationPaths, Relations, RequestContext, Transaction } from '@vendure/core';
import { Banner } from '../entities/banner.entity';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { BannerService } from '../service/banner.service';
import { BannerPermission } from '../banner-permissions';
import {
    QueryBannerArgs,
    MutationUpdateBannerArgs,
    MutationCreateBannerArgs,
    MutationDeleteBannerArgs,
    MutationDeleteBannerSectionArgs,
    QueryBannersArgs,
} from '../generated-admin-types';

@Resolver()
export class BannerAdminResolver {
    constructor(private readonly bannerService: BannerService) {}

    @Query()
    @Allow(BannerPermission.Read)
    async banners(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryBannersArgs,
        @Relations(Banner) relations: RelationPaths<Banner>,
    ): Promise<PaginatedList<Banner>> {
        return this.bannerService.findAll(ctx, args.options, relations);
    }

    @Query()
    @Allow(BannerPermission.Read)
    async banner(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryBannerArgs,
        @Relations(Banner) relations: RelationPaths<Banner>,
    ) {
        return this.bannerService.findOne(ctx, args.id, relations, false);
    }

    @Transaction()
    @Mutation()
    @Allow(BannerPermission.Update)
    async updateBanner(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationUpdateBannerArgs,
        @Relations(Banner) relations: RelationPaths<Banner>,
    ) {
        return this.bannerService.update(ctx, args.input, relations);
    }

    @Transaction()
    @Mutation()
    @Allow(BannerPermission.Create)
    async createBanner(@Ctx() ctx: RequestContext, @Args() args: MutationCreateBannerArgs) {
        return this.bannerService.create(ctx, args.input);
    }

    @Transaction()
    @Mutation()
    @Allow(BannerPermission.Delete)
    async deleteBanner(@Ctx() ctx: RequestContext, @Args() args: MutationDeleteBannerArgs): Promise<boolean> {
        return this.bannerService.delete(ctx, args.input.id);
    }

    @Transaction()
    @Mutation()
    @Allow(BannerPermission.Delete)
    async deleteBannerSection(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationDeleteBannerSectionArgs,
    ): Promise<boolean> {
        return this.bannerService.deleteSection(ctx, args.input.id);
    }
}
