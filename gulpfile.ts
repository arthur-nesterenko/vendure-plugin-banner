import { dest, parallel, src } from 'gulp';

const UI_EXTENSION_FILES = ['**/ui/**/*'];
const TRANSLATIONS_FILES = ['**/translations/**/*'];

function copyUiExtensionsSource() {
    return src(UI_EXTENSION_FILES, { cwd: 'src' }).pipe(dest('dist'));
}

function copyTranslations() {
    return src(TRANSLATIONS_FILES, { cwd: 'src' }).pipe(dest('dist'));
}

export const build = parallel(copyUiExtensionsSource, copyTranslations);
