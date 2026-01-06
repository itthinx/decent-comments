/**
 * index.js
 *
 * Copyright (c) www.itthinx.com
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

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, SelectControl, NumberControl } from '@wordpress/components';
import './editor.css';
import metadata from './block.json';
import { useState, useEffect } from '@wordpress/element';
import { fetchComments, RenderComments } from './commentsUtils.js';

registerBlockType( metadata.name, {
	apiVersion: 3,
	title: __('Decent Comments', 'decent-comments'),
	icon: 'admin-comments',
	category: 'widgets',
	attributes: {
		title: { type: 'string', default: '' },
		number: { type: 'number', default: 5 },
		offset: { type: 'number', default: 0 },
		post_id: { type: 'string', default: '' },
		post__in: { type: 'string', default: '' },
		post__not_in: { type: 'string', default: '' },
		post_tag: { type: 'string', default: '' },
		exclude_post_author: { type: 'boolean', default: false },
		show_author: { type: 'boolean', default: true },
		show_date: { type: 'boolean', default: true },
		link_authors: { type: 'boolean', default: true },
		show_avatar: { type: 'boolean', default: true },
		avatar_size: { type: 'number', default: 48 },
		show_link: { type: 'boolean', default: true },
		show_comment: { type: 'boolean', default: true },
		taxonomy: { type: 'string', default: ''},
		terms: { type: 'string', default: ''},
		pingback: { type: 'boolean', default: true },
		trackback: { type: 'boolean', default: true },
		show_excerpt: { type: 'boolean', default: true },
		max_excerpt_words: { type: 'number', default: 20 },
		max_excerpt_characters: { type: 'number', default: 0 },
		ellipsis:{ type: 'string', default: '' },
		strip_tags: { type: 'boolean', default: true },
		order: { type: 'string', default: 'desc' },
		orderby: { type: 'string', default: 'comment_date_gmt' },
		class: { type: 'string', default: '' },
		post_type: { type: 'string', default: 'post' },
	},
	edit: ({ attributes, setAttributes }) => {
		const blockProps = useBlockProps();
		const [comments, setComments] = useState([]);
		const [error, setError] = useState(null);

		useEffect(() => {
			const getComments = async () => {
				try {
					// Handle current_post_id and current_term_id
					const updatedAttributes = { ...attributes };
					if (attributes.post_id === '[current]' || attributes.post_id === '{current}') {
						updatedAttributes.post_id = '';
					}
					if (attributes.terms === '[current]' || attributes.terms === '{current}') {
						updatedAttributes.term_ids = '';
					}

					const nonce = window.decentCommentsEdit?.nonce || '';
					const response = await fetchComments(updatedAttributes, nonce);
					setComments(response.comments || []);
					setError(null);
				} catch (err) {
					setError(err);
					setComments([]);
				}
			};

			getComments();
		}, [attributes]);

		return (
			<>
				<InspectorControls>
					<PanelBody title={__('Comment Settings', 'decent-comments')}>
						<TextControl
							label={__('Title', 'decent-comments')}
							value={attributes.title}
							onChange={(value) => setAttributes({title: value})}
						/>
						<TextControl
							label={__('Number of Comments', 'decent-comments')}
							value={attributes.number}
							onChange={(value) => setAttributes({ number: parseInt(value) || 5 })}
							min="1"
							type="number"
						/>
						<SelectControl
							label={__('Order by...', 'decent-comments')}
							value={attributes.orderby}
							options={[
								{ label: __('Author Email', 'decent-comments'), value: 'comment_author_email' },
								{ label: __('Author URL', 'decent-comments'), value: 'comment_author_url' },
								{ label: __('Content', 'decent-comments'), value: 'comment_content' },
								{ label: __('Comment Date', 'decent-comments'), value: 'comment_date_gmt' },
								{ label: __('Karma', 'decent-comments'), value: 'comment_karma' },
								{ label: __('Post', 'decent-comments'), value: 'comment_post_id' }
							]}
							onChange={(value) => setAttributes({ orderby: value })}
						/>
						<SelectControl
							label={__('Sort order', 'decent-comments')}
							value={attributes.order}
							options={[
								{ label: __('Descending', 'decent-comments'), value: 'desc' },
								{ label: __('Ascending', 'decent-comments'), value: 'asc' }
							]}
							onChange={(value) => setAttributes({ order: value })}
						/>
						<TextControl
							label={__('Post ID', 'decent-comments')}
							value={attributes.post_id}
							onChange={(value) => setAttributes({ post_id: value || '' })}
							help={__('Title, empty, post ID or [current]', 'decent-comments')}
						/>
						<TextControl
							label={__('Post type', 'decent-comments')}
							value={attributes.post_type}
							onChange={(value) => setAttributes({ post_type: value })}
							help={__('Available post types: ' + decentCommentsEdit.post_types , 'decent-comments')}
						/>
						<ToggleControl
							label={__('Exclude comments from post authors', 'decent-comments')}
							checked={attributes.exclude_post_author}
							onChange={(value) => setAttributes({ exclude_post_author: value })}
						/>
						<ToggleControl
							label={__('Show comment excerpt', 'decent-comments')}
							checked={attributes.show_excerpt}
							onChange={(value) => setAttributes({ show_excerpt: value })}
						/>
						<TextControl
							label={__('Number of words in excerpts', 'decent-comments')}
							value={attributes.max_excerpt_words}
							onChange={(value) => setAttributes({ max_excerpt_words: parseInt(value) || 20 })}
							min="0"
							type="number"
						/>
						<TextControl
							label={__('Number of characters in excerpts', 'decent-comments')}
							value={attributes.max_excerpt_characters}
							onChange={(value) => setAttributes({ max_excerpt_characters: parseInt(value) || 0 })}
							min="0"
							type="number"
						/>
						<TextControl
							label={__('Ellipsis')}
							value={attributes.ellipsis}
							onChange={(value) => setAttributes({ ellipsis: value })}
							help={__('The ellipsis is shown after the excerpt when there is more content.', 'decent-comments')}
						/>
						<ToggleControl
							label={__('Show author', 'decent-comments')}
							checked={attributes.show_author}
							onChange={(value) => setAttributes({ show_author: value })}
						/>
						<ToggleControl
							label={__('Show date', 'decent-comments')}
							checked={attributes.show_date}
							onChange={(value) => setAttributes({ show_date: value })}
						/>
						<ToggleControl
							label={__('Link authors', 'decent-comments')}
							checked={attributes.link_authors}
							onChange={(value) => setAttributes({ link_authors: value })}
							help={__('Whether to link comment authors to their website.', 'decent-comments')}
						/>
						<ToggleControl
							label={__('Show avatar', 'decent-comments')}
							checked={attributes.show_avatar}
							onChange={(value) => setAttributes({ show_avatar: value })}
						/>
						<TextControl
							label={__('Avatar size', 'decent-comments')}
							value={attributes.avatar_size}
							onChange={(value) => setAttributes({ avatar_size: parseInt(value) || 48 })}
							min="0"
							type="number"
						/>
						<ToggleControl
							label={__('Show link to post', 'decent-comments')}
							checked={attributes.show_link}
							onChange={(value) => setAttributes({ show_link: value })}
						/>
						<ToggleControl
							label={__('Show the comment', 'decent-comments')}
							checked={attributes.show_comment}
							onChange={(value) => setAttributes({ show_comment: value })}
						/>
						<SelectControl
							label={__('Taxonomy', 'decent-comments')}
							value={attributes.taxonomy}
							options={[
								{ label: __('All post taxonomies', 'decent-comments'), value: '' },
								{ label: __('category', 'decent-comments'), value: 'category' },
								{ label: __('tag', 'decent-comments'), value: 'post_tag' }
							]}
							onChange={(value) => setAttributes({ taxonomy: value })}
							help={__('Select category if you would like to show comments on posts in certain categories. Give the desired categories\' slugs in Term. For tags select post_tag and give the tags\' slugs in Term.', 'decent-comments')}
						/>
						<TextControl
							label={__('Term', 'decent-comments')}
							value={attributes.terms}
							onChange={(value) => setAttributes({ terms: value })}
						/>
						<ToggleControl
							label={__('Pingbacks', 'decent-comments')}
							checked={attributes.pingback}
							onChange={(value) => setAttributes({ pingback: value })}
						/>
						<ToggleControl
							label={__('Trackbacks', 'decent-comments')}
							checked={attributes.trackback}
							onChange={(value) => setAttributes({ trackback: value })}
						/>
					</PanelBody>
				</InspectorControls>
				<div {...useBlockProps({ className: 'wp-block-itthinx-decent-comments', 'data-attributes': JSON.stringify(attributes) })}>
					{error ? (
						<div className="decent-comments-error">
							<p>
								{__('Error loading comments in editor', 'decent-comments')}
								{error.message && `: ${error.message}`}
							</p>
						</div>
					) : (
						<div className="wp-block-itthinx-decent-comments">
							<RenderComments comments={comments} attributes={attributes} />
						</div>
					)}
				</div>
			</>
		);
	},
	save: ({ attributes }) => {
		return (
			<div className="wp-block-itthinx-decent-comments" data-attributes={JSON.stringify(attributes)}>
				<p>{ __( 'Comments', 'decent-comments' ) } &hellip;</p>
			</div>
		);
	}

});