import { addNavMenuItem } from '@vendure/admin-ui/core';
import { Permission } from './generated-types';
export default [
    addNavMenuItem(
        {
            id: 'banners',
            label: 'banner-plugin.menu.label',
            requiresPermission: Permission.ReadBanner,
            routerLink: ['/extensions/banner/banners'],
            icon: 'picture',
        },
        'marketing',
    ),
];
