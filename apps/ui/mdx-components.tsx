import React from 'react';
import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs';
import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';
import { Callout } from 'nextra/components'

const themeComponents = getThemeComponents();

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		...themeComponents,
		...components,
		img: (props: ImageProps) => (
			<Image
				{...props}
				priority
				src={props.src}
				alt={props.alt}
				sizes="100vw"
				style={{
					objectFit: 'cover',
				}}
				loading="lazy"
				placeholder="blur"
				fill
			/>
		),
		Callout,
	};
}
