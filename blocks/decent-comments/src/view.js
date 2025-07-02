import { __ } from '@wordpress/i18n';
import { fetchComments, renderComments, parseAttributes } from './commentsUtils.js';

let current_post_id = null;
let current_term_id = null;
if ( window.decentCommentsView ) {
	if ( window.decentCommentsView.current_post_id ) {
		current_post_id = window.decentCommentsView.current_post_id;
	}
	if ( window.decentCommentsView.current_term_id ) {
		current_term_id = window.decentCommentsView.current_term_id;
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	const blocks = document.querySelectorAll('.wp-block-itthinx-decent-comments');
	for (const block of blocks) {
		try {
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

			const nonce = window.decentCommentsView?.nonce || '';
			const comments = await fetchComments(attributes, nonce);
			const html = renderComments(comments.comments, attributes);
			block.innerHTML = html;
		} catch (error) {
			block.innerHTML = `<p>${__('Error loading comments', 'decent-comments')}</p>`;
			console.error('Decent Comments Error:', error);
		}
	}
});
