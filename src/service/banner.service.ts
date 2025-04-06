import { Injectable } from '@nestjs/common';
import {
    assertFound,
    ID,
    ListQueryBuilder,
    EntityNotFoundError,
    PaginatedList,
    RequestContext,
    TransactionalConnection,
    TranslatorService,
    RelationPaths,
    Asset,
    Product,
    Collection,
} from '@vendure/core';
import { omit } from '@vendure/common/lib/omit';
import { Banner } from '../entities/banner.entity';
import { BannerSection } from '../entities/banner-section.entity';
import { BannerSectionTranslation } from '../entities/banner-section-translation.entity';
import { BannerSectionInput, CreateBannerInput, UpdateBannerInput } from '../generated-admin-types';

import { TranslationDiffer } from '@vendure/core/dist/service/helpers/translatable-saver/translation-differ';
import { patchEntity } from '@vendure/core/dist/service/helpers/utils/patch-entity';

@Injectable()
export class BannerService {
    constructor(
        private connection: TransactionalConnection,
        private translator: TranslatorService,
        private listQueryBuilder: ListQueryBuilder,
    ) {}

    async findByName(
        ctx: RequestContext,
        name: string,
        relations?: RelationPaths<Banner>,
    ): Promise<Banner | null> {
        const banner = await this.connection
            .getRepository(ctx, Banner)
            .findOne({ where: { name, enabled: true } });

        if (!banner) {
            throw new EntityNotFoundError('Banner', name);
        }

        const baseRelations = ['sections', 'sections.translations'] as RelationPaths<Banner>;

        const rlts = relations ? relations.concat(baseRelations) : baseRelations;
        return assertFound(this.findOne(ctx, banner?.id, rlts));
    }

    async findAll(
        ctx: RequestContext,
        options?: any,
        relations?: RelationPaths<Banner>,
    ): Promise<PaginatedList<Banner>> {
        const qb = this.listQueryBuilder.build<Banner>(Banner, options || undefined, {
            ctx,
            relations: ['sections', 'sections.translations'].concat(relations || []),
        });

        const [banners, totalItems] = await qb.getManyAndCount();

        return {
            items: banners.map((banner: Banner) => ({
                ...banner,
                sections: banner.sections
                    .map(section => this.translator.translate(section, ctx))
                    .sort((a, b) => a.position - b.position),
            })),
            totalItems,
        };
    }

    async findOne(ctx: RequestContext, id: ID, relations?: RelationPaths<Banner>): Promise<Banner | null> {
        const banner = await this.connection.getEntityOrThrow(ctx, Banner, id, {
            relations,
            where: { enabled: true },
        });

        const sections = banner?.sections
            ?.map(section => {
                const translatedData = this.translator.translate(section, ctx);
                return translatedData;
            })
            .sort((a, b) => a.position - b.position);

        return {
            ...banner,
            sections: sections ?? [],
        };
    }

    async create(ctx: RequestContext, input: CreateBannerInput) {
        const { sections: inputSections = [], ...bannerInput } = input;
        const sections = await Promise.all(inputSections.map(s => this.createSection(ctx, s)));

        const banner = new Banner();

        Object.assign(banner, bannerInput);

        banner.sections = sections;

        const result = await this.connection.getRepository(ctx, Banner).save(banner);

        return assertFound(result as any);
    }

    async update(ctx: RequestContext, input: UpdateBannerInput, relations?: RelationPaths<Banner>) {
        const { sections = [], ...banner } = input;
        const sectionToSave = await Promise.all(sections.map(section => this.upsertSection(ctx, section)));

        await this.connection.getRepository(ctx, Banner).save({
            ...banner,
            sections: sectionToSave,
        });

        const updatedBanner = this.findOne(ctx, input.id, relations);
        return assertFound(updatedBanner);
    }

    async delete(ctx: RequestContext, id: ID) {
        return this.deleteEntity(Banner, ctx, id);
    }

    async deleteSection(ctx: RequestContext, id: ID) {
        return this.deleteEntity(BannerSection, ctx, id);
    }

    private upsertSection = async (ctx: RequestContext, input: BannerSectionInput) => {
        if (!input.id) {
            return this.createSection(ctx, input);
        }

        const existingTranslations = await this.connection.getRepository(ctx, BannerSectionTranslation).find({
            where: { base: { id: input.id } },
            relations: ['base'],
        });

        const differ = new TranslationDiffer(BannerSectionTranslation as any, this.connection);

        const diff = differ.diff(existingTranslations, input.translations);

        const section = await this.createSectionWithoutTranslation(ctx, input);

        section.translations = existingTranslations;

        const bannerEntity = await differ.applyDiff(ctx, section, diff);

        // @ts-ignore
        bannerEntity.updatedAt = new Date();

        const updatedEntity = patchEntity(bannerEntity as any, omit(input, ['translations']));

        return updatedEntity;
    };

    private createSectionWithoutTranslation = async (ctx: RequestContext, input: BannerSectionInput) => {
        const section = new BannerSection();

        const asset = await this.connection.getEntityOrThrow(ctx, Asset, input.assetId!);

        section.asset = asset;

        if (input?.externalLink) {
            section.externalLink = input.externalLink;
        }

        if (input.productId) {
            const product = await this.connection.getEntityOrThrow(ctx, Product, input.productId);
            section.product = product;
        }

        if (input.collectionId) {
            const collection = await this.connection.getEntityOrThrow(ctx, Collection, input.collectionId);
            section.collection = collection;
        }

        section.position = input?.position ?? 0;

        return section;
    };

    private createSection = async (ctx: RequestContext, input: BannerSectionInput) => {
        const section = await this.createSectionWithoutTranslation(ctx, input);
        const translations = [];
        if (input.translations) {
            for (const translationInput of input.translations) {
                const translation = new BannerSectionTranslation();
                Object.assign(translation, translationInput);
                translations.push(translation);
            }
        }
        section.translations = translations;
        return section;
    };

    private deleteEntity = async (
        entity: Parameters<typeof TransactionalConnection.prototype.getRepository>[1],
        ctx: RequestContext,
        id: string | number,
    ) => {
        const result = await this.connection.getRepository(ctx, entity).delete(id);
        return !!(result?.affected && result?.affected > 0);
    };
}
