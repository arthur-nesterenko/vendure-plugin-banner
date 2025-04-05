import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem } from '@vendure/admin-ui/core';
import { Permission } from './generated-types';

@NgModule({
    imports: [SharedModule],
    providers: [
        addNavMenuItem(
            {
                id: 'banners',
                label: 'banner-plugin.menu.label',
                requiresPermission: Permission.ReadBanner,
                routerLink: ['/extensions/banner'],
                icon: 'picture',
            },
            'marketing',
        ),
    ],
})
export class BannerUiExtensionSharedModule {}
