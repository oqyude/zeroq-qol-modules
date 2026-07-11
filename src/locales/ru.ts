import { Locale } from './en';

export const ru: Locale = {
	settings: {
		title: 'ZeroQ QoL Modules',
		description: 'Включайте и отключайте модули по своему усмотрению.',
	},
	modules: {
		'attachment-clean-paste': {
			name: 'Attachment Clean Paste',
			description:
				'Заменяет ![[вложение]] на [[вложение|имя]] для указанных расширений при вставке/перетаскивании',
			descriptionShort:
				'Заменяет ![[вложение]] на [[вложение|имя]] для указанных расширений.',
			extensionsLabel: 'Расширения файлов',
			extensionsDesc:
				'Расширения через запятую (например: png, jpg, pdf, mp3). Файлы с этими расширениями будут вставляться как [[path/file|name]] вместо ![[path/file]].',
			extensionsPlaceholder: 'png, jpg, jpeg, gif, svg, webp, pdf',
		},
		'preserve-link-aliases': {
			name: 'Сохранение алиасов ссылок',
			description:
				'Сохраняет оригинальные алиасы ссылок при переименовании вложений',
			processEmbedsLabel: 'Обрабатывать embed-ссылки',
			processEmbedsDesc: 'Также обрабатывать ![[embed]] ссылки (по умолчанию выключено)',
			processCanvasLabel: 'Обрабатывать Canvas-файлы',
			processCanvasDesc: 'Также обрабатывать ссылки в Canvas (.canvas) файлах',
		},
	},
};
