import { DeepPartial } from '@vendure/common/lib/shared-types';
import { Translatable, Translation, VendureEntity, Asset, Product, Collection } from '@vendure/core';
import { Entity, OneToMany, ManyToOne, JoinColumn, JoinTable, Column } from 'typeorm';
import { BannerSectionTranslation } from './banner-section-translation.entity';
import { Banner } from './banner.entity';

/**
 * @description
 * A `BannerSection` is a single visual unit within a {@link Banner}. It
 * carries a cover {@link Asset} together with translatable text
 * (title, description, call-to-action) and a link target — either a
 * {@link Product}, a {@link Collection}, or an `externalLink` URL.
 * Sections within a banner are ordered by `position`.
 *
 * @category Entities
 */
@Entity()
export class BannerSection extends VendureEntity implements Translatable {
    constructor(input?: DeepPartial<BannerSection>) {
        super(input);
    }

    @ManyToOne(() => Asset, { onDelete: 'SET NULL', eager: true })
    asset!: Asset;

    @ManyToOne(() => Collection)
    @JoinTable()
    collection: Collection;

    @ManyToOne(() => Product)
    @JoinColumn()
    product: Product;

    @Column({ nullable: true })
    externalLink: string;

    @OneToMany(() => BannerSectionTranslation, translation => translation.base, { cascade: true })
    translations: Array<Translation<BannerSection>>;

    @ManyToOne(() => Banner, banner => banner.sections, {
        onDelete: 'CASCADE',
    })
    banner: Banner;

    @Column({ type: 'int', default: 0 })
    position: number;
}
