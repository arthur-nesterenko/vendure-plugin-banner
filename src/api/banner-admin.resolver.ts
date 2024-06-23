import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Allow, Ctx, RelationPaths, Relations, RequestContext, Transaction } from '@vendure/core';
import { Banner } from '../entities/banner.entity';
import { PaginatedList } from '@vendure/common/lib/shared-types';
import { BannerService } from '../service/banner.service';
import { BannerPermission } from '../banner-permissions';
import {
    QueryBannerArgs,
    UpdateBannerMutationVariables,
    MutationCreateBannerArgs,
    MutationDeleteBannerArgs,
    MutationDeleteBannerSectionArgs,
    QueryBannersArgs,
} from '../ui/generated/ui';

@Resolver()
export class BannerAdminResolver {
    constructor(private readonly bannerService: BannerService) {}

    @Query()
    @Allow(BannerPermission.Read)
    async banners(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryBannersArgs,
    ): Promise<PaginatedList<Banner>> {
        return this.bannerService.findAll(ctx, args.options);
    }

    @Query()
    @Allow(BannerPermission.Read)
    async banner(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryBannerArgs,
        @Relations(Banner) relations: RelationPaths<Banner>,
    ) {
        return this.bannerService.findOne(ctx, args.id, relations);
    }

    @Transaction()
    @Mutation()
    @Allow(BannerPermission.Update)
    async updateBanner(@Ctx() ctx: RequestContext, @Args() args: UpdateBannerMutationVariables) {
        return this.bannerService.update(ctx, args.input);
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
