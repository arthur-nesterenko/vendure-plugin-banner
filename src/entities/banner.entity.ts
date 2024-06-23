import { DeepPartial } from '@vendure/common/lib/shared-types';
import { VendureEntity } from '@vendure/core';
import { Column, Entity, OneToMany } from 'typeorm';
import { BannerSection } from './banner-section.entity';

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
