/**
 * commentsUtils.js
 *
 * Copyright (c) ww.itthinx.com
 *
 * This code is released under the GNU General Public License.
 * See COPYRIGHT.txt and LICENSE.txt.
 *
 * This code is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * This header and all notices must be kept intact.
 *
 * @author George Tsiokos
 * @package decent-comments
 * @since decent-comments 3.0.0
 */

import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

async function initializeComments() {
	const blocks = document.querySelectorAll('.wp-block-itthinx-decent-comments');
	const results = [];
	for (const block of blocks) {
		try {
			const result = await processCommentBlock(block);
			results.push({ block, ...result });
		} catch (error) {
			block.innerHTML = `<p>${__('Error loading comments', 'decent-comments')}</p>`;
		}
	}
	return results;
}

async function processCommentBlock(block) {
	try {
		const attributes = parseAttributes(block.dataset.attributes);
		if (attributes.post_id === '[current]' || attributes.post_id === '{current}') {
			if (window.current_post_id) {
				attributes.post_id = window.current_post_id;
			}
		}
		if (attributes.terms === '[current]' || attributes.terms === '{current}') {
			if (window.current_term_id) {
				attributes.term_ids = window.current_term_id;
			}
		}
		const response = await fetchComments(attributes, block.dataset.nonce || window.decentCommentsNonce);
		return { comments: response.comments || [], attributes };
	} catch (error) {
		console.error('Decent Comments Error:', error);
		throw error;
	}
}

export function parseAttributes(data) {
	return JSON.parse(data || '{}');
}

export async function fetchComments(attributes, nonce) {
	const query = buildQuery(attributes);

	try {
		const response = await apiFetch({
			path: `decent-comments/v1/comments?${query.toString()}`,
			method: 'GET',
			headers: {
				'X-WP-Nonce': nonce,
				'Content-Type': 'application/json',
			},
		});

		return response;
	} catch (error) {
		console.error('Failed to fetch comments:', error);
	}
}

function buildQuery(attributes) {
	const params = {
		number: attributes.number || 5,
		offset: attributes.offset || 0,
		order: attributes.order || 'asc',
		orderby: attributes.orderby || 'comment_author_email',
		...(attributes.post_id && { post_id: attributes.post_id }),
		...(attributes.post__in && { post__in: attributes.post__in }),
		...(attributes.post__not_in && { post__not_in: attributes.post__not_in }),
		...(attributes.post_type && { post_type: attributes.post_type }),
		...(attributes.taxonomy && { taxonomy: attributes.taxonomy }),
		...(attributes.terms && { terms: attributes.terms }),
		...(attributes.term_ids && { term_ids: attributes.term_ids }),
		...(attributes.exclude_post_author && { exclude_post_author: attributes.exclude_post_author }),
		...(attributes.pingback && { pingback: attributes.pingback }),
		...(attributes.trackback && { trackback: attributes.trackback }),
		...(attributes.avatar_size && { avatar_size: attributes.avatar_size }),
	};
	return new URLSearchParams(params);
}

export const RenderComments = ({ comments, attributes }) => {
	return (
		<div className="decent-comments">
			{attributes.title?.length > 0 && (
				<div className="decent-comments-heading gamma widget-title">
					{attributes.title}
				</div>
			)}
			<ul className="decent-comments-list">
				{comments.length === 0 ? (
					<li className="comment no-comment">{ __( 'No comments', 'decent-comments' ) }</li>
				) : (
					comments
					.filter(
						(comment) =>
							!attributes.exclude_post_author ||
							comment.author_email !== comment.post_author
					)
					.map((comment) => (
					<RenderComment key={comment.id} comment={comment} attributes={attributes} />
				))
			)}
			</ul>
		</div>
	);
};

export const RenderComment = ({ comment, attributes }) => {
	const author = attributes.show_author ? (
		attributes.link_authors && comment.author_url ? (
			<a href={safeEncodedUrl(comment.author_url)} className="comment-author-link">
				{comment.author}
			</a>
		) : (
			comment.author
		)
	) : null;

	const date = attributes.show_date ? (
		`${comment.date} ${__('at', 'decent-comments')} ${comment.time}`
	) : null;

	const avatarSize = attributes.avatar_size || 24;
	const avatarStyle = {
		width: `${avatarSize}px`,
		height: `${avatarSize}px`,
		flexShrink: 0,
	};
	let pre_avatar = '';
	let post_avatar = '';
	if ( comment.author_url ) {
		pre_avatar = '<a href="' + comment.author_url +'" rel="external">';
		post_avatar = '</a>';
	}

	const avatar = attributes.show_avatar && comment.avatar ? (
		<div 
			className="comment-avatar" 
			style={avatarStyle} 
			dangerouslySetInnerHTML={{ __html: pre_avatar + comment.avatar + post_avatar }} 
		/>
	) : null;

	const excerpt = attributes.show_comment ? formatExcerpt(comment.content, attributes) : '';

	const link = attributes.show_link && comment.comment_link ? (
		<div className="comment-link">
			{ __( 'on', 'decent-comments' ) }{ ' ' }
			<a href={safeEncodedUrl( comment.comment_link ) } className="comment-post-title">
				{decodeEntities(comment.post_title)}
			</a>
		</div>
	) : null;

	return (
		<li key={comment.id} className="comment-entry">
			<div className="comment-content">
				{ avatar }
				{author && <div className="comment-author">{decodeEntities(author)}{' '}</div>}
				{date && <div className="comment-date">{date}{' '}</div>}
				{link}{' '}
				{excerpt && <div className="comment-excerpt">{excerpt}</div>}
			</div>
		</li>
	);
};

function formatExcerpt(string, attributes) {
	if (!attributes.show_excerpt || !string) return '';

	let excerpt = string;

	if (attributes.strip_tags) {
		excerpt = decodeEntities(string);
	}

	if (attributes.max_excerpt_words > 0) {
		const words = excerpt.split(/\s+/).filter(word => word.length > 0);
		excerpt = words.slice(0, attributes.max_excerpt_words).join(' ') +
			(words.length > attributes.max_excerpt_words ? (attributes.ellipsis || '…') : '');
	}

	if (attributes.max_excerpt_characters > 0) {
		excerpt = excerpt.substring(0, attributes.max_excerpt_characters) +
			(excerpt.length > attributes.max_excerpt_characters ? (attributes.ellipsis || '…') : '');
	}

	return excerpt;
}

function decodeEntities(text) {
	if (!text || typeof text !== 'string') return '';

	return text
		.replace(/&#8211;/g, '–')   // En-dash
		.replace(/&#8212;/g, '—')   // Em-dash
		.replace(/&#8217;/g, '’')   // Right single quotation mark (apostrophe)
		.replace(/&#8220;/g, '“')   // Left double quotation mark
		.replace(/&#8221;/g, '”')   // Right double quotation mark
		.replace(/&#8230;/g, '…')
		.replace(/&raquo;/g, '»')
		.replace(/&laquo;/g, '«')
		.replace(/&#91;/g, '[')
		.replace(/&#93;/g, ']')
		.replace(/&amp;/g, '&')     // Ampersand
		.replace(/&lt;/g, '<')      // Less than
		.replace(/&gt;/g, '>');     // Greater than
}

function handleError(block, error) {
	block.innerHTML = `<p>${__('Error loading comments', 'decent-comments')}</p>`;
	console.error('Decent Comments Error:', error);
}

function safeEncodedUrl(url) {
	try {
		const parsed = new URL(url);
		if (['http:', 'https:'].includes(parsed.protocol)) {
			return encodeURI(url);
		}
		return '#';
	} catch {
		return '#';
	}
}

export default RenderComments;
