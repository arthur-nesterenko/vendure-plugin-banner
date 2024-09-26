import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule, CanDeactivateDetailGuard } from '@vendure/admin-ui/core';
import { Observable } from 'rxjs';
import { Banner } from './generated/ui';
import { map } from 'rxjs/operators';
import { BannerListComponent } from './banner-list/banner-list.component';
import { BannerDetailComponent } from './banner-detail/banner-detail.component';
import { BannerSectionComponent } from './banner-section/banner-section.component';
import { BannerDetailResolver } from './banner-detail/banner-detail.resolver';

export function bannerDetailBreadcrumb(resolved: { entity: Observable<Banner> }) {
    return resolved.entity.pipe(
        map(entity => [
            {
                label: 'banner-plugin.menu.label',
                link: ['/extensions', 'banner'],
            },
            {
                label: 'banner-plugin.menu.label',
                link: [],
            },
        ]),
    );
}
@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild([
            {
                path: '',
                pathMatch: 'full',
                component: BannerListComponent,
                data: { breadcrumb: 'banner-plugin.menu.breadcrumb' },
            },

            {
                path: ':id',
                component: BannerDetailComponent,
                resolve: { entity: BannerDetailResolver },
                canDeactivate: [CanDeactivateDetailGuard],
                data: { breadcrumb: bannerDetailBreadcrumb },
            },
        ]),
    ],
    declarations: [BannerDetailComponent, BannerListComponent, BannerSectionComponent],
    providers: [BannerDetailResolver],
})
export class BannerUiLazyModule {}
