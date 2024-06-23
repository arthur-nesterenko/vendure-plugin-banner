import { LanguageCode } from '@vendure/common/lib/generated-types';
import { DeepPartial } from '@vendure/common/lib/shared-types';
import { Column, Entity, ManyToOne } from 'typeorm';

import { BannerSection } from './banner-section.entity';
import { Translation, VendureEntity } from '@vendure/core';

@Entity()
export class BannerSectionTranslation extends VendureEntity implements Translation<BannerSection> {
    constructor(input?: DeepPartial<BannerSectionTranslation>) {
        super(input);
    }

    @Column({ type: 'varchar' })
    languageCode: LanguageCode;

    @Column()
    callToAction: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @ManyToOne(() => BannerSection, base => base.translations, {
        onDelete: 'CASCADE',
    })
    base: BannerSection;
}
