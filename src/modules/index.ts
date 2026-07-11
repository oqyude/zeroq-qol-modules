import { AttachmentCleanPasteModule } from './attachment-clean-paste';
import { PreserveLinkAliasesModule } from './preserve-link-aliases';
import { QoLModule } from '../types';

export const MODULES: QoLModule[] = [
	new AttachmentCleanPasteModule(),
	new PreserveLinkAliasesModule(),
];
