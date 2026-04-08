import { Button, VendureImage } from '@vendure/dashboard';
import { XIcon } from 'lucide-react';

interface SelectedItemProps {
    name: string;
    image?: { preview: string } | null;
    onClear: () => void;
}

export function SelectedItem({ name, image, onClear }: SelectedItemProps) {
    return (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
            {image && (
                <VendureImage
                    asset={{ id: '', preview: image.preview }}
                    preset="tiny"
                    className="w-8 h-8 object-cover rounded"
                />
            )}
            <span className="text-sm flex-1 truncate">{name}</span>
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                <XIcon className="h-3 w-3" />
            </Button>
        </div>
    );
}
