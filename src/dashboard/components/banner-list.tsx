import { Trans, useLingui } from '@lingui/react/macro';
import { ActionBarItem, Badge, Button, DetailPageButton, ListPage } from '@vendure/dashboard';
import type { DashboardRouteDefinition } from '@vendure/dashboard';
import { useNavigate } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { graphql } from '@/gql';
import { bannerFragment } from '../types/fragments';

const getBannersDocument = graphql(
    `
        query GetBanners($options: BannerListOptions) {
            banners(options: $options) {
                items {
                    ...Banner
                }
                totalItems
            }
        }
    `,
    [bannerFragment],
);

const deleteBannerDocument = graphql(`
    mutation DeleteBanner($input: DeleteBannerInput!) {
        deleteBanner(input: $input)
    }
`);

export const bannerList: DashboardRouteDefinition = {
    navMenuItem: {
        sectionId: 'marketing',
        id: 'banners',
        url: '/banners',
        title: 'Banners',
    },
    path: '/banners',
    loader: () => ({
        breadcrumb: 'Banners',
    }),
    component: route => <BannerListPage route={route} />,
};

function BannerListPage({ route }: { route: any }) {
    const { t } = useLingui();
    const navigate = useNavigate();
    return (
        <ListPage
            pageId="banner-list"
            title={t`Banners`}
            listQuery={getBannersDocument}
            deleteMutation={deleteBannerDocument as any}
            route={route}
            customizeColumns={{
                name: {
                    cell: ({ row }) => {
                        const banner = row.original;
                        return <DetailPageButton id={banner.id} label={banner.name} />;
                    },
                },
                sections: {
                    header: t`Section Count`,
                    cell: ({ row }) => {
                        const banner = row.original;
                        return <Badge variant="secondary">{banner.sections?.length ?? 0}</Badge>;
                    },
                },
                enabled: {
                    cell: ({ row }) => {
                        const banner = row.original;
                        return (
                            <Badge variant={banner.enabled ? 'default' : 'secondary'}>
                                {banner.enabled ? t`Enabled` : t`Disabled`}
                            </Badge>
                        );
                    },
                },
            }}
            defaultVisibility={{
                name: true,
                sections: true,
                enabled: true,
            }}
            defaultColumnOrder={['name', 'sections', 'enabled']}
        >
            <ActionBarItem itemId="create-banner">
                <Button
                className="cursor-pointer"
                    onClick={() =>
                        navigate({ to: '/banners/$id', params: { id: 'new' } } as any)
                    }
                >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    <Trans>Create Banner</Trans>
                </Button>
            </ActionBarItem>
        </ListPage>
    );
}
