import React, { useEffect, useRef, useState } from 'react';

export const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
	value,
	onChange,
	apiKey,
	init,
	placeholder,
	disabled
}) => {
	const editorRef = useRef<TinyMCEEditorInstance | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [scriptLoaded, setScriptLoaded] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		if (window.tinymce) {
			setScriptLoaded(true);
			return;
		}
		const existingScript = document.querySelector(`script[src*="tinymce.min.js"]`);
		if (existingScript) {
			const checkTinymce = setInterval(() => {
				if (window.tinymce) {
					setScriptLoaded(true);
					clearInterval(checkTinymce);
				}
			}, 100);
			return () => clearInterval(checkTinymce);
		}

		const script = document.createElement('script');
		script.src = `https://cdn.tiny.cloud/1/${apiKey}/tinymce/8/tinymce.min.js`;
		script.referrerPolicy = "origin";
		script.crossOrigin = "anonymous";
		script.onload = () => setScriptLoaded(true);
		document.head.appendChild(script);
	}, [apiKey]);

	useEffect(() => {
		if (!scriptLoaded || !textareaRef.current) return;

		const initEditor = async () => {
			if (textareaRef.current) {
				const existingEditor = window.tinymce.get(textareaRef.current);
				if (existingEditor) {
					existingEditor.remove();
				}
			}

			window.tinymce.init({
				target: textareaRef.current!,
				...init,
				setup: (editor: TinyMCEEditorInstance) => {
					editorRef.current = editor;

					editor.on('init', () => {
						if (value) {
							editor.setContent(value);
						}
						if (disabled) {
							editor.mode.set('readonly');
						}
					});

					editor.on('change keyup', () => {
						const content = editor.getContent();
						onChange(content);
					});

					if (init?.setup) {
						init.setup(editor);
					}
				}
			});
		};

		initEditor();

		return () => {
			if (editorRef.current) {
				try {
					editorRef.current.remove();
				} catch (e) {
					console.warn("TinyMCE remove failed", e);
				}
				editorRef.current = null;
			}
		};
	}, [scriptLoaded]);

	useEffect(() => {
		if (editorRef.current && editorRef.current.initialized) {
			const currentContent = editorRef.current.getContent();
			if (currentContent !== value) {
				editorRef.current.setContent(value || '');
			}
		}
	}, [value]);

	useEffect(() => {
		if (editorRef.current && editorRef.current.initialized) {
			editorRef.current.mode.set(disabled ? 'readonly' : 'design');
		}
	}, [disabled]);

	return (
		<textarea ref={textareaRef} placeholder={placeholder} style={{ visibility: 'hidden' }} />
	);
};
