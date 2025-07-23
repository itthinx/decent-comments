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

//import React from 'react';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

export async function initializeComments() {
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

export async function processCommentBlock(block) {
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
	const response = await apiFetch({
		path: `decent-comments/v1/comments?${query.toString()}`,
		method: 'GET',
		headers: {
			'X-WP-Nonce': nonce,
		},
	});
	return response;
}

export function buildQuery(attributes) {
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
					{sanitizeHTML(attributes.title)}
				</div>
			)}
			<ul className="decent-comments">
				{comments.length === 0 ? (
					<li>{__('No Comments', 'decent-comments')}</li>
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
			<a href={sanitizeHTML(comment.author_url)} className="comment-author-link">
				{sanitizeHTML(comment.author)}
			</a>
		) : (
			sanitizeHTML(comment.author)
		)
	) : null;

	const dateOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour12: true,
	};
	const date = attributes.show_date ? (
		`${new Date(comment.date).toLocaleDateString(undefined, dateOptions)} ${__('at', 'decent-comments')} ${new Date(comment.date).toLocaleTimeString()}`
	) : null;

	let pre_avatar = '';
	let post_avatar = '';
	if ( comment.author_url ) {
		pre_avatar = '<a href="' + comment.author_url +'" rel="external">';
		post_avatar = '</a>';
	}

	const avatar = attributes.show_avatar && comment.avatar ?
		<span className="comment-avatar" dangerouslySetInnerHTML={{ __html: pre_avatar + comment.avatar + post_avatar }} />
		:
		null;

	const excerpt = attributes.show_comment ? formatExcerpt(comment.content, attributes) : '';

	const postTitle = attributes.show_link && comment.comment_link ? (
		<span>
			{__('on', 'decent-comments')}{' '}
			<a href={sanitizeHTML(comment.comment_link || '#')} className="comment-post-title">
				{sanitizeHTML(comment.post_title || '')}
			</a>
		</span>
	) : null;

	return (
		<li key={comment.id} className="comment">
			{ avatar }
			<div className="comment-content">
				{author && <span className="comment-author">{author}{' '}</span>}
				{date && <span className="comment-date">{date}{' '}</span>}
				{postTitle}{' '}
				{excerpt && <span className="comment-excerpt">{excerpt}</span>}
			</div>
		</li>
	);
};

export function formatExcerpt(content, attributes) {
	let excerpt = attributes.show_excerpt ? content : '';

	if (attributes.strip_tags) {
		excerpt = excerpt.replace(/(<([^>]+)>)/gi, '');
	}

	if (attributes.max_excerpt_words > 0) {
		const words = excerpt.split(' ');
		excerpt = words.slice(0, attributes.max_excerpt_words).join(' ') +
		(words.length > attributes.max_excerpt_words ? sanitizeHTML(attributes.ellipsis) : '');
	}

	if (attributes.max_excerpt_characters > 0) {
		excerpt = excerpt.substring(0, attributes.max_excerpt_characters) +
		(excerpt.length > attributes.max_excerpt_characters ? sanitizeHTML(attributes.ellipsis) : '');
	}

	return sanitizeHTML(excerpt);
}

export function handleError(block, error) {
	block.innerHTML = `<p>${__('Error loading comments', 'decent-comments')}</p>`;
	console.error('Decent Comments Error:', error);
}

export function sanitizeHTML(str) {
	const div = document.createElement('div');
	div.textContent = str || '';
	return div.innerHTML;
}

export default RenderComments;