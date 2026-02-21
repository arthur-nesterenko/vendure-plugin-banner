import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { AssetPickerDialog, Button, VendureImage, cn, type Asset } from '@vendure/dashboard';
import { ImageIcon, XIcon } from 'lucide-react';

interface CoverImageProps {
    selectedAsset: Asset | null;
    error?: { message?: string } | null;
    onAssetSelected: (asset: Asset) => void;
    onAssetRemoved: () => void;
}

export function CoverImage({ selectedAsset, error, onAssetSelected, onAssetRemoved }: CoverImageProps) {
    const { t } = useLingui();
    const [pickerOpen, setPickerOpen] = useState(false);

    return (
        <div className="space-y-2">
            <div className="text-sm font-medium">
                <Trans>Cover Image</Trans> <span className="text-destructive">*</span>
            </div>
            {selectedAsset ? (
                <div className="flex items-start gap-3">
                    <VendureImage
                        asset={selectedAsset}
                        alt={selectedAsset.name || ''}
                        preset="medium"
                        className="w-36 h-20 object-cover rounded border"
                    />
                    <div className="flex flex-col gap-1.5">
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {selectedAsset.name}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPickerOpen(true)}
                            >
                                <Trans>Change</Trans>
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={onAssetRemoved}>
                                <XIcon className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className={cn(
                        'flex items-center justify-center gap-2 w-full h-20 border-2 border-dashed rounded-lg transition-colors',
                        error
                            ? 'border-destructive/50 bg-destructive/5 hover:border-destructive'
                            : 'hover:border-primary hover:bg-muted/50',
                    )}
                >
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        <Trans>Select cover image</Trans>
                    </span>
                </button>
            )}
            {error ? (
                <p className="text-sm text-destructive">{error?.message || t`Cover image is required`}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
                <Trans>Landscape images work best as banner backgrounds.</Trans>
            </p>

            <AssetPickerDialog
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={assets => {
                    if (assets.length > 0) {
                        const asset = assets[0];
                        onAssetSelected({
                            id: asset.id,
                            preview: asset.preview,
                            name: asset.name,
                        });
                    }
                }}
                initialSelectedAssets={selectedAsset ? [selectedAsset] : []}
                multiSelect={false}
                title={t`Select Cover Image`}
            />
        </div>
    );
}
