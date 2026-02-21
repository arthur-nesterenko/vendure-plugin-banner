import { Trans, useLingui } from '@lingui/react/macro';
import {
    Button,
    DetailFormGrid,
    FormFieldWrapper,
    Input,
    Page,
    PageActionBar,
    PageActionBarRight,
    PageBlock,
    PageLayout,
    PageTitle,
    Switch,
    detailPageRouteLoader,
    useDetailPage,
} from '@vendure/dashboard';
import type { DashboardRouteDefinition } from '@vendure/dashboard';
import { AnyRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { graphql } from '@/gql';
import { bannerFragment } from '../../types/fragments';
import { BannerSectionsManager } from './banner-sections-manager';

const bannerDetailDocument = graphql(
    `
        query GetBannerDetail($id: ID!) {
            banner(id: $id) {
                ...Banner
            }
        }
    `,
    [bannerFragment],
);

const createBannerDocument = graphql(
    `
        mutation CreateBanner($input: CreateBannerInput!) {
            createBanner(input: $input) {
                ...Banner
            }
        }
    `,
    [bannerFragment],
);

const updateBannerDocument = graphql(
    `
        mutation UpdateBanner($input: UpdateBannerInput!) {
            updateBanner(input: $input) {
                ...Banner
            }
        }
    `,
    [bannerFragment],
);

export const bannerDetail: DashboardRouteDefinition = {
    path: '/banners/$id',
    loader: detailPageRouteLoader<typeof bannerDetailDocument>({
        queryDocument: bannerDetailDocument,
        breadcrumb: (isNew, entity) => [
            { path: '/banners', label: 'Banners' },
            isNew ? 'New Banner' : entity?.name || '',
        ],
    }),
    component: route => {
        return <BannerDetailPage route={route} />;
    },
};

function BannerDetailPage({ route }: { route: AnyRoute }) {
    const { t } = useLingui();
    const params = route.useParams();
    const navigate = useNavigate();
    const creatingNewEntity = params.id === 'new';
    const expandedSections = !creatingNewEntity;

    /**
     * TODO: Get the default language code from the channel
     */
    const languageCode = 'en' as const;
    const { form, submitHandler, entity, isPending, resetForm, refreshEntity } = useDetailPage<
        typeof bannerDetailDocument,
        typeof createBannerDocument,
        typeof updateBannerDocument
    >({
        queryDocument: bannerDetailDocument,
        createDocument: createBannerDocument,
        updateDocument: updateBannerDocument,
        setValuesForUpdate: (banner => {
            if (!banner) {
                return {
                    id: '',
                    name: '',
                    enabled: true,
                    sections: [],
                };
            }

            const sections = (banner.sections || []).map(section => {
                const translations = section?.translations || [];

                return {
                    id: section.id,
                    assetId: section.asset?.id || null,
                    asset: section.asset || null,
                    productId: section.product?.id || null,
                    collectionId: section.collection?.id || null,
                    externalLink: section.externalLink || null,
                    position: section.position + 1,
                    translations: translations.map(translation => ({
                        id: translation.id,
                        languageCode: translation.languageCode,
                        title: translation.title || '',
                        description: translation.description || '',
                        callToAction: translation.callToAction || '',
                    })),
                };
            });

            const defaultSection = {
                assetId: null,
                asset: null,
                productId: null,
                collectionId: null,
                externalLink: null,
                position: 1,
                translations: [{ languageCode, title: '', description: '', callToAction: '' }],
            };

            return {
                id: banner.id,
                name: banner.name || '',
                enabled: banner.enabled ?? true,
                sections: sections.length > 0 ? sections : [defaultSection],
            };
        }) as any,
        params: { id: params.id },
        onSuccess: async (data: any) => {
            toast.success(
                creatingNewEntity ? t`Banner created successfully` : t`Banner updated successfully`,
            );
            resetForm();
            if (creatingNewEntity && data?.id) {
                await navigate({ to: '/banners/$id', params: { id: data.id } } as any);
            } else {
                await refreshEntity();
            }
        },
        onError: err => {
            toast.error(t`Failed to update banner`, {
                description: err instanceof Error ? err.message : t`Unknown error`,
            });
        },
    });

    const { isDirty, isValid } = form.formState;

    return (
        <Page pageId="banner-detail" form={form} submitHandler={submitHandler}>
            <PageTitle>{creatingNewEntity ? <Trans>New Banner</Trans> : entity?.name || ''}</PageTitle>
            <PageActionBar>
                <PageActionBarRight>
                    <Button type="submit" disabled={!isDirty || !isValid || isPending}>
                        {creatingNewEntity ? <Trans>Create</Trans> : <Trans>Update</Trans>}
                    </Button>
                </PageActionBarRight>
            </PageActionBar>
            <PageLayout>
                <PageBlock column="main" blockId="main-form">
                    <DetailFormGrid>
                        <FormFieldWrapper
                            control={form.control}
                            name="name"
                            label={<Trans>Name</Trans>}
                            render={({ field }) => <Input {...field} />}
                        />
                        <FormFieldWrapper
                            control={form.control}
                            name="enabled"
                            label={<Trans>Enabled</Trans>}
                            render={({ field }) => (
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                    </DetailFormGrid>
                </PageBlock>
                <PageBlock column="main" blockId="sections">
                    <BannerSectionsManager
                        languageCode={languageCode}
                        form={form}
                        expandedSections={expandedSections}
                    />
                </PageBlock>
            </PageLayout>
        </Page>
    );
}
