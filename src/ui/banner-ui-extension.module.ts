import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuSection } from '@vendure/admin-ui/core';
import { Permission } from './generated/ui';

@NgModule({
    imports: [SharedModule],
    providers: [
        addNavMenuSection(
            {
                id: 'Banner',
                label: 'Banner',
                requiresPermission: Permission.ReadBanner,
                items: [
                    {
                        id: 'Banner',
                        label: 'Banner',
                        routerLink: ['/extensions/banner'],
                        icon: 'picture',
                        requiresPermission: Permission.ReadBanner,
                    },
                ],
            },
            'marketing',
        ),
    ],
})
export class BannerUiExtensionSharedModule {}
