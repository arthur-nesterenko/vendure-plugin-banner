import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { ContentFields } from './content-fields';

function TestWrapper({ sectionPath }: { sectionPath: string }) {
    const { control } = useForm({
        defaultValues: {
            sections: [
                {
                    translations: [{ title: 'Test Title', description: 'Test desc', callToAction: 'CTA' }],
                },
            ],
        },
    });
    return <ContentFields control={control} sectionPath={sectionPath} />;
}

describe('ContentFields', () => {
    it('renders title, description, and call to action fields', () => {
        render(<TestWrapper sectionPath="sections.0" />);
        expect(screen.getByTestId('field-sections.0.translations.0.title')).toBeInTheDocument();
        expect(screen.getByTestId('field-sections.0.translations.0.description')).toBeInTheDocument();
        expect(screen.getByTestId('field-sections.0.translations.0.callToAction')).toBeInTheDocument();
    });
});
