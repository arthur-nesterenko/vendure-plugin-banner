import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectedItem } from './selected-item';

describe('SelectedItem', () => {
    it('renders name and clear button', async () => {
        const user = userEvent.setup();
        const onClear = vi.fn();
        render(<SelectedItem name="My Product" onClear={onClear} />);
        expect(screen.getByText('My Product')).toBeInTheDocument();
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        await user.click(button);
        expect(onClear).toHaveBeenCalled();
    });

    it('renders image when provided', () => {
        render(
            <SelectedItem
                name="With Image"
                image={{ preview: 'https://example.com/img.jpg' }}
                onClear={vi.fn()}
            />,
        );
        expect(screen.getByTestId('vendure-image')).toBeInTheDocument();
        expect(screen.getByTestId('vendure-image')).toHaveAttribute('src', 'https://example.com/img.jpg');
    });

    it('does not render image when image is null', () => {
        const { container } = render(<SelectedItem name="No Image" image={null} onClear={vi.fn()} />);
        expect(container.querySelector('img')).not.toBeInTheDocument();
    });
});
