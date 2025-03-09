import { copySync } from 'fs-extra';
import path from 'node:path';

copySync(path.join(__dirname, '../src/ui'), path.join(__dirname, '../dist/ui'));
copySync(path.join(__dirname, '../src/translations'), path.join(__dirname, '../dist/translations'));
