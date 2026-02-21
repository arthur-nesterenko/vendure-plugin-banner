import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, api } from '@vendure/dashboard';
import { toast } from 'sonner';
import { graphql } from '@/gql';
import { BannerSection } from '../banner-section';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { PlusIcon } from 'lucide-react';

const deleteBannerSectionDocument = graphql(`
    mutation DeleteBannerSection($input: DeleteBannerSectionInput!) {
        deleteBannerSection(input: $input)
    }
`);

type BannerSectionsManagerProps = {
    form: UseFormReturn<any>;
    expandedSections: boolean;
    languageCode: string;
};

export function BannerSectionsManager({ form, expandedSections, languageCode }: BannerSectionsManagerProps) {
    const { t } = useLingui();
    const { control, watch } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'sections',
    });

    const sections = watch('sections') || [];

    const addSection = () => {
        const maxPosition = sections.length > 0 ? Math.max(...sections.map((s: any) => s.position || 0)) : 0;
        append({
            position: maxPosition + 1,
            assetId: null,
            asset: null,
            productId: null,
            collectionId: null,
            externalLink: null,
            translations: [{ languageCode, title: '', description: '', callToAction: '' }],
        });
    };

    const deleteSection = async (index: number, sectionId?: string) => {
        if (sectionId) {
            try {
                await api.mutate(deleteBannerSectionDocument, {
                    input: { id: sectionId },
                });
                toast.success(t`Section deleted successfully`);
            } catch {
                toast.error(t`Failed to delete section`);
                return;
            }
        }
        remove(index);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    <Trans>Sections</Trans>
                </h3>
                <Button type="button" variant="outline" onClick={addSection}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    <Trans>Add Section</Trans>
                </Button>
            </div>

            {fields.map((field, index) => {
                const section = sections[index];
                const sectionId = section?.id;

                return (
                    <BannerSection
                        key={field.id}
                        sectionIndex={index}
                        isExpanded={expandedSections}
                        canDelete={index > 0 || !!sectionId}
                        onDelete={() => deleteSection(index, sectionId)}
                    />
                );
            })}

            {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <Trans>No sections yet. Click &quot;Add Section&quot; to create one.</Trans>
                </div>
            )}
        </div>
    );
}
