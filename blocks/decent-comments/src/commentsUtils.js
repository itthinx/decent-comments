/**
 * commentsUtils.js
 *
 * Copyright (c) 2011 "kento" Karim Rahimpur www.itthinx.com
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
	for (const block of blocks) {
		try {
			await processCommentBlock(block);
		} catch (error) {
			handleError(block, error);
		}
	}
}

async function processCommentBlock(block) {
	const attributes = parseAttributes(block.dataset.attributes);
	if (attributes.post_id === '[current]' || attributes.post_id === '{current}') {
		if (current_post_id) {
			attributes.post_id = current_post_id;
		}
	}
	if (attributes.terms === '[current]' || attributes.terms === '{current}') {
		if (current_term_id) {
			attributes.term_ids = current_term_id;
		}
	}

	let comments = await fetchComments(attributes);

	const html = renderComments(comments.comments, attributes);
	block.innerHTML = html;
}

function parseAttributes(data) {
	return JSON.parse(data || '{}');
}

async function fetchComments(attributes, nonce) {
	const query = buildQuery(attributes);

	const response = await apiFetch({
		path: `decent-comments/v1/comments?${query.toString()}`,
		method: 'GET',
		headers: {
			'X-WP-Nonce': nonce
		}
	});
	return response;
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
		...(attributes.trackback && { trackback: attributes.trackback })
	};
	return new URLSearchParams(params);
}

function renderComments(comments, attributes) {
	let output = '<div class="decent-comments">';

	if (attributes.title?.length > 0) {
		output += `<div class="decent-comments-heading gamma widget-title">${sanitizeHTML(attributes.title)}</div>`;
	}

	output += '<ul class="decent-comments">';

	if (comments.length === 0) {
		output += `<li>${__('No Comments', 'decent-comments')}</li>`;
	} else {
		output += comments
			.filter(comment => !attributes.exclude_post_author || comment.author_email !== comment.post_author)
			.map(comment => renderComment(comment, attributes))
			.join('');
	}

	output += '</ul></div>';
	return output;
}

function renderComment(comment, attributes) {
	const author = attributes.show_author 
		? attributes.link_authors && comment.author_url 
			? `<a href="${sanitizeHTML(comment.author_url)}" class="comment-author-link">${sanitizeHTML(comment.author)}</a>`
			: comment.author
		: '';

	const dateOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour12: true
	};
	const date = attributes.show_date 
		? `${new Date(comment.date).toLocaleDateString(undefined, dateOptions)} ${__('at', 'decent-comments')} ${new Date(comment.date).toLocaleTimeString()}`
		: '';

	const avatar = attributes.show_avatar && comment.avatar 
		? `<img src="${sanitizeHTML(comment.avatar)}" alt="${sanitizeHTML(author)}" width="${attributes.avatar_size || 48}" height="${attributes.avatar_size || 48}" />`
		: '';

	const excerpt = attributes.show_comment ? formatExcerpt(comment.content, attributes) : '';

	const postTitle = attributes.show_link && comment.comment_link 
		? `${__('on', 'decent-comments')} <a href="${sanitizeHTML(comment.comment_link || '#')}" class="comment-post-title">${sanitizeHTML(comment.post_title || '')}</a>`
		: '';

	return `
		<li class="comment">
			${avatar}
			<div class="comment-content">
				${author ? `<span class="comment-author">${author}</span>` : ''}
				${date ? `<span class="comment-date">${date}</span>` : ''}
				${postTitle}
				<span class="comment-excerpt">${excerpt}</span>
			</div>
		</li>`;
}

function formatExcerpt(content, attributes) {
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

function handleError(block, error) {
	block.innerHTML = `<p>${__('Error loading comments', 'decent-comments')}</p>`;
	console.error('Decent Comments Error:', error);
}

function sanitizeHTML(str) {
	const div = document.createElement('div');
	div.textContent = str;
	return div.innerHTML;
}

export {
	initializeComments,
	processCommentBlock,
	parseAttributes,
	fetchComments,
	buildQuery,
	renderComments,
	renderComment,
	formatExcerpt,
	handleError,
	sanitizeHTML
};