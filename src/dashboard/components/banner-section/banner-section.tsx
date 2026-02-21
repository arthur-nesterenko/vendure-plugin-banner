import React, { useState } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { cn, type Asset } from '@vendure/dashboard';
import { SectionHeader, CoverImage, ContentFields, LinkSelector } from './components';

interface BannerSectionProps {
    sectionIndex: number;
    isExpanded?: boolean;
    onToggle?: () => void;
    onDelete?: () => void;
    canDelete?: boolean;
}

export function BannerSection({
    sectionIndex,
    isExpanded: initialExpanded = true,
    onToggle,
    onDelete,
    canDelete = false,
}: BannerSectionProps) {
    const { control, setValue } = useFormContext();
    const { errors } = useFormState({ control });
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    const sectionPath = `sections.${sectionIndex}` as const;
    const translationPath = `${sectionPath}.translations.0` as const;
    const selectedAsset = useWatch({ control, name: `${sectionPath}.asset` });
    const productId = useWatch({ control, name: `${sectionPath}.productId` });
    const collectionId = useWatch({ control, name: `${sectionPath}.collectionId` });
    const externalLink = useWatch({ control, name: `${sectionPath}.externalLink` });
    const title = useWatch({ control, name: `${translationPath}.title` });
    const callToAction = useWatch({ control, name: `${translationPath}.callToAction` });

    const sectionErrors = (errors.sections as any)?.[sectionIndex];
    const hasErrors = sectionErrors && Object.keys(sectionErrors).length > 0;

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
        onToggle?.();
    };

    const handleAssetSelected = (asset: Asset) => {
        setValue(`${sectionPath}.asset`, asset);
        setValue(`${sectionPath}.assetId`, asset.id, { shouldDirty: true });
    };

    const handleAssetRemoved = () => {
        setValue(`${sectionPath}.asset`, null);
        setValue(`${sectionPath}.assetId`, null, { shouldDirty: true });
    };

    const handleLinkChange = (field: string, value: string | null) => {
        setValue(`${sectionPath}.${field}`, value, { shouldDirty: true });
    };

    return (
        <div className={cn('rounded-lg border', hasErrors && 'border-destructive')}>
            <SectionHeader
                handleToggle={handleToggle}
                selectedAsset={selectedAsset}
                title={title}
                callToAction={callToAction}
                canDelete={canDelete}
                onDelete={onDelete}
                isExpanded={isExpanded}
            />

            {isExpanded && (
                <div className="px-4 pb-4 space-y-6 border-t pt-4">
                    <CoverImage
                        selectedAsset={selectedAsset}
                        error={sectionErrors?.assetId}
                        onAssetSelected={handleAssetSelected}
                        onAssetRemoved={handleAssetRemoved}
                    />
                    <ContentFields control={control} sectionPath={sectionPath} />
                    <LinkSelector
                        control={control}
                        sectionPath={sectionPath}
                        productId={productId}
                        collectionId={collectionId}
                        externalLink={externalLink}
                        onLinkChange={handleLinkChange}
                    />
                </div>
            )}
        </div>
    );
}
