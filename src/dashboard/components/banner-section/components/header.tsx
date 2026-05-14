import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, VendureImage, type Asset } from '@vendure/dashboard';
import { ChevronDownIcon, ChevronUpIcon, GripVerticalIcon, ImageIcon } from 'lucide-react';

interface SectionHeaderProps {
    handleToggle: () => void;
    selectedAsset: Asset | null;
    title: string;
    callToAction: string;
    canDelete: boolean;
    onDelete?: () => void;
    isExpanded: boolean;
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function SectionHeader({
    handleToggle,
    selectedAsset,
    title,
    callToAction,
    canDelete,
    onDelete,
    isExpanded,
    dragHandleProps,
}: SectionHeaderProps) {
    return (
        <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
            onClick={handleToggle}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                    type="button"
                    className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground flex-shrink-0"
                    onClick={e => e.stopPropagation()}
                    {...dragHandleProps}
                >
                    <GripVerticalIcon className="h-4 w-4" />
                </button>
                {selectedAsset ? (
                    <VendureImage
                        asset={selectedAsset}
                        alt={selectedAsset.name || ''}
                        preset="tiny"
                        className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                        {title || (
                            <span className="text-muted-foreground italic">
                                <Trans>Untitled Section</Trans>
                            </span>
                        )}
                    </div>
                    {callToAction && (
                        <div className="text-xs text-muted-foreground truncate">{callToAction}</div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {canDelete && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive cursor-pointer"
                        onClick={e => {
                            e.stopPropagation();
                            onDelete?.();
                        }}
                    >
                        <Trans>Delete</Trans>
                    </Button>
                )}
                {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </div>
        </div>
    );
}
