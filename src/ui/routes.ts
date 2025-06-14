import { registerRouteComponent } from '@vendure/admin-ui/core';
import { BannerListComponent } from './banner-list/banner-list.component';
import { BannerDetailComponent } from './banner-detail/banner-detail.component';
// import { BannerSectionComponent } from './banner-section/banner-section.component';
import { BannerDetailResolver } from './banner-detail/banner-detail.resolver';

export default [
    registerRouteComponent({
        path: 'banners',
        component: BannerListComponent,
        title: 'Banners',
        locationId: 'banners',
        description: 'Banner list',
        breadcrumb: 'Banners',
    }),
    registerRouteComponent({
        path: 'banners/:id',
        component: BannerDetailComponent,
        entityKey: 'banner',
        routeConfig: {
            resolve: {
                entity: BannerDetailResolver,
            },
        },
    }),
];
