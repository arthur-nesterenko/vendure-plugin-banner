import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, api } from '@vendure/dashboard';
import { toast } from 'sonner';
import { graphql } from '@/gql';
import { BannerSection } from '../banner-section';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { PlusIcon } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

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
    const { fields, append, remove, move } = useFieldArray({
        control,
        name: 'sections',
    });

    const sections = watch('sections') || [];

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = fields.findIndex(f => f.id === active.id);
        const newIndex = fields.findIndex(f => f.id === over.id);
        move(oldIndex, newIndex);

        // Update position values to match new order
        const updatedSections = watch('sections');
        updatedSections.forEach((_: any, i: number) => {
            form.setValue(`sections.${i}.position`, i + 1, { shouldDirty: true });
        });
    };

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

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    {fields.map((field, index) => {
                        const section = sections[index];
                        const sectionId = section?.id;

                        return (
                            <BannerSection
                                key={field.id}
                                sortableId={field.id}
                                sectionIndex={index}
                                isExpanded={expandedSections}
                                canDelete={index > 0 || !!sectionId}
                                onDelete={() => deleteSection(index, sectionId)}
                            />
                        );
                    })}
                </SortableContext>
            </DndContext>

            {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <Trans>No sections yet. Click &quot;Add Section&quot; to create one.</Trans>
                </div>
            )}
        </div>
    );
}
