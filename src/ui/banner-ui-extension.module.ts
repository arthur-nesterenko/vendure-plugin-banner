import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuSection, addNavMenuItem } from '@vendure/admin-ui/core';
import { Permission } from './generated/ui';

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
