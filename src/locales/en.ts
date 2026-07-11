export interface Locale {
	settings: {
		title: string;
		description: string;
	};
	modules: {
		'attachment-clean-paste': {
			name: string;
			description: string;
			descriptionShort: string;
			extensionsLabel: string;
			extensionsDesc: string;
			extensionsPlaceholder: string;
		};
		'preserve-link-aliases': {
			name: string;
			description: string;
			processEmbedsLabel: string;
			processEmbedsDesc: string;
			processCanvasLabel: string;
			processCanvasDesc: string;
		};
	};
}

export const en: Locale = {
	settings: {
		title: 'ZeroQ QoL Modules',
		description: 'Enable or disable modules as you wish.',
	},
	modules: {
		'attachment-clean-paste': {
			name: 'Attachment Clean Paste',
			description:
				'Replaces ![[embed]] with [[path/file|name]] for configured file extensions on paste/drop',
			descriptionShort:
				'Replaces ![[embed]] with [[path/file|name]] for specified file extensions.',
			extensionsLabel: 'File extensions',
			extensionsDesc:
				'Comma-separated extensions (e.g.: png, jpg, pdf, mp3). Files with these extensions will be inserted as [[path/file|name]] instead of ![[path/file]].',
			extensionsPlaceholder: 'png, jpg, jpeg, gif, svg, webp, pdf',
		},
		'preserve-link-aliases': {
			name: 'Preserve Link Aliases',
			description:
				'Preserves original link aliases when attachments are renamed',
			processEmbedsLabel: 'Process embed links',
			processEmbedsDesc: 'Also process ![[embed]] links (disabled by default)',
			processCanvasLabel: 'Process Canvas files',
			processCanvasDesc: 'Also process links in Canvas (.canvas) files',
		},
	},
};
