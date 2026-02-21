import { Trans, useLingui } from '@lingui/react/macro';
import { FormFieldWrapper, Input, Textarea } from '@vendure/dashboard';
import type { Control } from 'react-hook-form';

interface ContentFieldsProps {
    control: Control<any>;
    sectionPath: string;
}

export function ContentFields({ control, sectionPath }: ContentFieldsProps) {
    const { t } = useLingui();
    const translationPath = `${sectionPath}.translations.0`;
    return (
        <div className="space-y-3">
            <FormFieldWrapper
                control={control}
                name={`${translationPath}.title`}
                label={<Trans>Title</Trans>}
                render={({ field }) => <Input {...field} />}
            />
            <FormFieldWrapper
                control={control}
                name={`${translationPath}.description`}
                label={<Trans>Description</Trans>}
                render={({ field }) => <Textarea {...field} rows={3} />}
            />
            <FormFieldWrapper
                control={control}
                name={`${translationPath}.callToAction`}
                label={<Trans>Call to Action</Trans>}
                render={({ field }) => <Input {...field} placeholder={t`e.g. Shop Now`} />}
            />
        </div>
    );
}
