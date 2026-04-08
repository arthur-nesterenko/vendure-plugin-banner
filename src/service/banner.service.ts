import { Injectable } from '@nestjs/common';
import {
    assertFound,
    EventBus,
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
    TranslatableSaver,
} from '@vendure/core';
import { BannerEvent } from '../events/banner.event';
import { Banner } from '../entities/banner.entity';
import { BannerSection } from '../entities/banner-section.entity';
import { BannerSectionTranslation } from '../entities/banner-section-translation.entity';
import { BannerSectionInput, CreateBannerInput, UpdateBannerInput } from '../generated-admin-types';

/**
 * @description
 * Service that manages {@link Banner} entities and their nested
 * {@link BannerSection}s. Handles CRUD, translation persistence via
 * `TranslatableSaver`, and publishes a {@link BannerEvent} on every
 * mutating call so subscribers can react (e.g. cache invalidation).
 *
 * @category Services
 */
@Injectable()
export class BannerService {
    /** @internal */
    constructor(
        private connection: TransactionalConnection,
        private translator: TranslatorService,
        private listQueryBuilder: ListQueryBuilder,
        private translatableSaver: TranslatableSaver,
        private eventBus: EventBus,
    ) {}

    /**
     * @description
     * Looks up a single enabled banner by its unique `name`. Throws
     * `EntityNotFoundError` when no enabled banner with that name
     * exists. Sections are eagerly loaded along with their
     * translations.
     */
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

    /**
     * @description
     * Returns a paginated list of banners. Each banner's sections are
     * translated into the request's language and sorted by `position`
     * before being returned.
     */
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

    /**
     * @description
     * Loads a single banner by id, translating and ordering its
     * sections. Pass `onlyEnabled = false` to also resolve disabled
     * banners — useful for the admin API where authors need to edit
     * unpublished content.
     */
    async findOne(
        ctx: RequestContext,
        id: ID,
        relations?: RelationPaths<Banner>,
        onlyEnabled = true,
    ): Promise<Banner | null> {
        const banner = await this.connection.getEntityOrThrow(ctx, Banner, id, {
            relations,
            where: { enabled: onlyEnabled ? true : undefined },
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

    /**
     * @description
     * Creates a new banner with its initial set of sections, persists
     * everything in a single transaction, and publishes a
     * `BannerEvent` of type `'created'`.
     */
    async create(ctx: RequestContext, input: CreateBannerInput) {
        const { sections: inputSections = [], ...bannerInput } = input;
        const sections = await Promise.all(inputSections.map(s => this.createSection(ctx, s)));

        const banner = new Banner();

        Object.assign(banner, bannerInput);

        banner.sections = sections;

        const result = await this.connection.getRepository(ctx, Banner).save(banner);
        this.eventBus.publish(new BannerEvent(ctx, result.id, 'created'));
        return assertFound(result as any);
    }

    /**
     * @description
     * Updates an existing banner. Sections supplied without an `id`
     * are created; sections with an `id` are upserted (both
     * translatable and non-translatable fields). Publishes a
     * `BannerEvent` of type `'updated'`.
     */
    async update(ctx: RequestContext, input: UpdateBannerInput, relations?: RelationPaths<Banner>) {
        const { sections = [], ...banner } = input;

        const sectionToSave = await Promise.all(sections.map(section => this.upsertSection(ctx, section)));

        await this.connection.getRepository(ctx, Banner).save({
            ...banner,
            sections: sectionToSave,
        });

        this.eventBus.publish(new BannerEvent(ctx, input.id, 'updated'));
        const updatedBanner = this.findOne(ctx, input.id, relations, false);
        return assertFound(updatedBanner);
    }

    /**
     * @description
     * Deletes a banner and all of its sections via the cascading
     * relation. Publishes a `BannerEvent` of type `'deleted'` when
     * the row is actually removed. Returns `true` if a row was
     * affected.
     */
    async delete(ctx: RequestContext, id: ID) {
        const result = await this.deleteEntity(Banner, ctx, id);
        if (result) {
            this.eventBus.publish(new BannerEvent(ctx, id, 'deleted'));
        }
        return result;
    }

    /**
     * @description
     * Deletes a single {@link BannerSection} from its parent banner.
     * Returns `true` if a row was affected.
     */
    async deleteSection(ctx: RequestContext, id: ID) {
        return this.deleteEntity(BannerSection, ctx, id);
    }

    /** @internal */
    private upsertSection = async (ctx: RequestContext, input: BannerSectionInput) => {
        if (!input.id) {
            return this.createSection(ctx, input);
        }

        // Update translatable fields (title, description, callToAction per language)
        const updatedSection = await this.translatableSaver.update({
            ctx,
            entityType: BannerSection,
            translationType: BannerSectionTranslation,
            input: input as Required<BannerSectionInput>,
        });

        // Update non-translatable fields that TranslatableSaver doesn't handle
        const sectionRepo = this.connection.getRepository(ctx, BannerSection);
        const updatePayload: Record<string, any> = {};

        if (input.externalLink !== undefined) {
            updatePayload.externalLink = input.externalLink;
        }
        if (input.position !== undefined) {
            updatePayload.position = input.position;
        }
        if (input.assetId !== undefined) {
            updatePayload.asset = input.assetId
                ? await this.connection.getEntityOrThrow(ctx, Asset, input.assetId)
                : null;
        }
        if (input.productId !== undefined) {
            updatePayload.product = input.productId
                ? await this.connection.getEntityOrThrow(ctx, Product, input.productId)
                : null;
        }
        if (input.collectionId !== undefined) {
            updatePayload.collection = input.collectionId
                ? await this.connection.getEntityOrThrow(ctx, Collection, input.collectionId)
                : null;
        }

        if (Object.keys(updatePayload).length > 0) {
            return sectionRepo.save({
                ...updatedSection,
                ...updatePayload,
            });
        }

        return updatedSection;
    };

    /** @internal */
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

    /** @internal */
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

    /** @internal */
    private deleteEntity = async (
        entity: Parameters<typeof TransactionalConnection.prototype.getRepository>[1],
        ctx: RequestContext,
        id: string | number,
    ) => {
        const result = await this.connection.getRepository(ctx, entity).delete(id);
        return !!(result?.affected && result?.affected > 0);
    };
}
