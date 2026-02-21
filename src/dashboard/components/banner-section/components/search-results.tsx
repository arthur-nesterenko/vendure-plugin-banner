import { Trans } from '@lingui/react/macro';
import { VendureImage, type Asset } from '@vendure/dashboard';

export interface SearchResultItem {
    id: string;
    name: string;
    image?: Asset | null;
}

interface SearchResultsProps {
    isLoading: boolean;
    items: SearchResultItem[];
    onSelect: (id: string) => void;
}

export function SearchResults({ isLoading, items, onSelect }: SearchResultsProps) {
    return (
        <div className="border rounded-md max-h-48 overflow-auto">
            {isLoading ? (
                <div className="p-2 text-sm text-muted-foreground">
                    <Trans>Loading...</Trans>
                </div>
            ) : items.length > 0 ? (
                items.map(item => (
                    <div
                        key={item.id}
                        className="p-2 cursor-pointer hover:bg-muted flex items-center gap-2"
                        onClick={() => onSelect(item.id)}
                    >
                        {item.image && (
                            <VendureImage
                                asset={item.image}
                                preset="tiny"
                                className="w-8 h-8 object-cover rounded"
                            />
                        )}
                        <span className="text-sm">{item.name}</span>
                    </div>
                ))
            ) : (
                <div className="p-2 text-sm text-muted-foreground">
                    <Trans>No results found</Trans>
                </div>
            )}
        </div>
    );
}
