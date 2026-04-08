import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, OneToMany } from 'typeorm';
import { BannerSection } from './banner-section.entity';

/**
 * @description
 * A `Banner` is a named collection of {@link BannerSection}s that can be
 * rendered on the storefront. Banners are looked up by id or by name
 * via the Shop API and can be enabled or disabled to control whether
 * they are returned to public consumers.
 *
 * @category Entities
 */
@Entity()
export class Banner extends VendureEntity {
    constructor(input?: DeepPartial<Banner>) {
        super(input);
    }

    @Column({ unique: true })
    name: string;

    @Column({ default: true })
    enabled: boolean;

    @OneToMany(() => BannerSection, section => section.banner, {
        cascade: true,
    })
    sections: BannerSection[];
}
