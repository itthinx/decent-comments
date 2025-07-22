/**
 * view.js
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

import { createRoot } from 'react-dom/client';
import { __ } from '@wordpress/i18n';
import { fetchComments, RenderComments, parseAttributes } from './commentsUtils.js';


let current_post_id = null;
let current_term_id = null;
if (window.decentCommentsView) {
	if (window.decentCommentsView.current_post_id) {
		current_post_id = window.decentCommentsView.current_post_id;
	}
	if (window.decentCommentsView.current_term_id) {
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
			const response = await fetchComments(attributes, nonce);
			const root = createRoot(block);
			root.render(
				<RenderComments comments={response.comments || []} attributes={attributes} />
			);
		} catch (error) {
			const root = createRoot(block);
				root.render(
					<p className="text-red-500">
						{__('Error loading comments', 'decent-comments')}
					</p>
				);
			console.error('Decent Comments Error:', error);
		}
	}
});
