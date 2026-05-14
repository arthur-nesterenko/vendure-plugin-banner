import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionHeader } from './header';

describe('SectionHeader', () => {
    it('renders title and call to action', () => {
        const handleToggle = vi.fn();
        render(
            <SectionHeader
                handleToggle={handleToggle}
                selectedAsset={null}
                title="Summer Sale"
                callToAction="Shop Now"
                canDelete={false}
                isExpanded={false}
            />,
        );
        expect(screen.getByText('Summer Sale')).toBeInTheDocument();
        expect(screen.getByText('Shop Now')).toBeInTheDocument();
    });

    it('shows Untitled Section when title is empty', () => {
        render(
            <SectionHeader
                handleToggle={vi.fn()}
                selectedAsset={null}
                title=""
                callToAction=""
                canDelete={false}
                isExpanded={false}
            />,
        );
        expect(screen.getByText('Untitled Section')).toBeInTheDocument();
    });

    it('calls handleToggle when the header is clicked', async () => {
        const user = userEvent.setup();
        const handleToggle = vi.fn();
        render(
            <SectionHeader
                handleToggle={handleToggle}
                selectedAsset={null}
                title="Section"
                callToAction=""
                canDelete={false}
                isExpanded={false}
            />,
        );
        await user.click(screen.getByText('Section'));
        expect(handleToggle).toHaveBeenCalled();
    });

    it('shows Delete button when canDelete is true and calls onDelete when clicked', async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        render(
            <SectionHeader
                handleToggle={vi.fn()}
                selectedAsset={null}
                title="Section"
                callToAction=""
                canDelete
                onDelete={onDelete}
                isExpanded={false}
            />,
        );
        const deleteBtn = screen.getByRole('button', { name: 'Delete' });
        expect(deleteBtn).toBeInTheDocument();
        await user.click(deleteBtn);
        expect(onDelete).toHaveBeenCalled();
    });

    it('does not show Delete button when canDelete is false', () => {
        render(
            <SectionHeader
                handleToggle={vi.fn()}
                selectedAsset={null}
                title="Section"
                callToAction=""
                canDelete={false}
                isExpanded={false}
            />,
        );
        const buttons = screen.queryAllByRole('button', { name: 'Delete' });
        expect(buttons).toHaveLength(0);
    });
});
