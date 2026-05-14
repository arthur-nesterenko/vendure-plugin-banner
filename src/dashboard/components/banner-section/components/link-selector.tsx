import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { FormFieldWrapper, Input, api, cn } from '@vendure/dashboard';
import { useQuery } from '@tanstack/react-query';
import { graphql } from '@/gql';
import type { Control } from 'react-hook-form';
import { SelectedItem } from './selected-item';
import { SearchResults } from './search-results';

const searchProductsDocument = graphql(`
    query SearchProducts($input: SearchInput!) {
        search(input: $input) {
            items {
                productId
                productName
                productAsset {
                    id
                    preview
                }
            }
        }
    }
`);

const getCollectionsDocument = graphql(`
    query GetCollections($options: CollectionListOptions) {
        collections(options: $options) {
            items {
                id
                name
                featuredAsset {
                    id
                    preview
                }
            }
        }
    }
`);

const getProductByIdDocument = graphql(`
    query GetProductById($id: ID!) {
        product(id: $id) {
            id
            name
            featuredAsset {
                id
                preview
            }
        }
    }
`);

const getCollectionByIdDocument = graphql(`
    query GetCollectionById($id: ID!) {
        collection(id: $id) {
            id
            name
            featuredAsset {
                id
                preview
            }
        }
    }
`);

export type LinkType = 'product' | 'collection' | 'external';

interface LinkSelectorProps {
    control: Control<any>;
    sectionPath: string;
    productId: string | null;
    collectionId: string | null;
    externalLink: string | null;
    onLinkChange: (field: string, value: string | null) => void;
}

export function LinkSelector({
    control,
    sectionPath,
    productId,
    collectionId,
    externalLink,
    onLinkChange,
}: LinkSelectorProps) {
    const { t } = useLingui();
    const [linkType, setLinkType] = useState<LinkType | null>(() => {
        if (productId) return 'product';
        if (collectionId) return 'collection';
        if (externalLink) return 'external';
        return null;
    });
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [collectionSearchTerm, setCollectionSearchTerm] = useState('');

    const linkOptions: Array<{ value: LinkType; label: string }> = [
        { value: 'collection', label: t`Collection` },
        { value: 'product', label: t`Product` },
        { value: 'external', label: t`External Link` },
    ];

    const { data: productData } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => api.query(getProductByIdDocument, { id: productId }),
        enabled: !!productId,
    });

    const { data: collectionData } = useQuery({
        queryKey: ['collection', collectionId],
        queryFn: () => api.query(getCollectionByIdDocument, { id: collectionId }),
        enabled: !!collectionId,
    });

    const { data: productsData, isLoading: productsLoading } = useQuery({
        queryKey: ['products-search', productSearchTerm],
        queryFn: () =>
            api.query(searchProductsDocument, {
                input: { term: productSearchTerm, take: 10 },
            }),
        enabled: productSearchTerm.length >= 2,
    });

    const { data: collectionsData, isLoading: collectionsLoading } = useQuery({
        queryKey: ['collections-search', collectionSearchTerm],
        queryFn: () =>
            api.query(getCollectionsDocument, {
                options: {
                    filter: { name: { contains: collectionSearchTerm } },
                    take: 10,
                },
            }),
        enabled: collectionSearchTerm.length >= 2,
    });

    const selectedProduct = productData?.product;
    const selectedCollection = collectionData?.collection;

    const clearConflictingLinks = (activeType: LinkType) => {
        if (activeType !== 'product') onLinkChange('productId', null);
        if (activeType !== 'collection') onLinkChange('collectionId', null);
        if (activeType !== 'external') onLinkChange('externalLink', null);
    };

    const handleLinkTypeChange = (type: LinkType) => {
        if (linkType === type) {
            setLinkType(null);
            onLinkChange('productId', null);
            onLinkChange('collectionId', null);
            onLinkChange('externalLink', null);
            return;
        }
        setLinkType(type);
        setProductSearchTerm('');
        setCollectionSearchTerm('');
    };

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium">
                <Trans>Link</Trans>
            </div>
            <div className="inline-flex p-1 bg-muted rounded-lg">
                {linkOptions.map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => handleLinkTypeChange(value)}
                        className={cn(
                            'px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer',
                            linkType === value
                                ? 'bg-background shadow-sm font-medium'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {linkType === 'product' && (
                <div className="space-y-2">
                    {selectedProduct ? (
                        <SelectedItem
                            name={selectedProduct.name}
                            image={selectedProduct.featuredAsset}
                            onClear={() => onLinkChange('productId', null)}
                        />
                    ) : (
                        <>
                            <Input
                                placeholder={t`Search for a product...`}
                                value={productSearchTerm}
                                onChange={e => setProductSearchTerm(e.target.value)}
                            />
                            {productSearchTerm.length >= 2 && productsData?.search?.items && (
                                <SearchResults
                                    isLoading={productsLoading}
                                    items={productsData.search.items.map(item => ({
                                        id: item.productId,
                                        name: item.productName,
                                        image: item.productAsset,
                                    }))}
                                    onSelect={id => {
                                        clearConflictingLinks('product');
                                        onLinkChange('productId', id);
                                        setProductSearchTerm('');
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            {linkType === 'collection' && (
                <div className="space-y-2">
                    {selectedCollection ? (
                        <SelectedItem
                            name={selectedCollection.name}
                            image={selectedCollection.featuredAsset}
                            onClear={() => onLinkChange('collectionId', null)}
                        />
                    ) : (
                        <>
                            <Input
                                placeholder={t`Search for a collection...`}
                                value={collectionSearchTerm}
                                onChange={e => setCollectionSearchTerm(e.target.value)}
                            />
                            {collectionSearchTerm.length >= 2 && collectionsData?.collections?.items && (
                                <SearchResults
                                    isLoading={collectionsLoading}
                                    items={collectionsData.collections.items.map(c => ({
                                        id: c.id,
                                        name: c.name,
                                        image: c.featuredAsset,
                                    }))}
                                    onSelect={id => {
                                        clearConflictingLinks('collection');
                                        onLinkChange('collectionId', id);
                                        setCollectionSearchTerm('');
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            {linkType === 'external' && (
                <FormFieldWrapper
                    control={control}
                    name={`${sectionPath}.externalLink`}
                    label={<Trans>URL</Trans>}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="url"
                            placeholder="https://example.com"
                            onChange={e => {
                                clearConflictingLinks('external');
                                field.onChange(e);
                            }}
                        />
                    )}
                />
            )}
        </div>
    );
}
