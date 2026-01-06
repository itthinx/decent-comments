<?php
/**
 * class-decent-comments-blocks.php
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

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Decent Comments Blocks, register the plugin's block and handles related resources.
 */
class Decent_Comments_Blocks {

	/**
	 * Where it all initializes
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'decent_comments_block_init' ) );
		add_action( 'the_post', array( __CLASS__, 'the_post' ), 10, 2 );
	}

	/**
	 * Hooked to the_post and retrieve post_id or term_id, used to transform [current] and {current}
	 *
	 * @param WP_Post $post
	 * @param WP_Query $wp_query
	 */
	public static function the_post( $post, $wp_query ) {
		$current_post_id = null;
		$current_term_id = null;
		if ( $wp_query->is_main_query() ) {

			if ( $wp_query->is_singular ) {
				$current_post_id = get_queried_object_id();
			}
			if ( $wp_query->is_archive ) {
				$current_term_id = get_queried_object_id();
			}
			wp_localize_script(
				'decent-comments-block-view',
				'decentCommentsView',
				array(
					'nonce'    => wp_create_nonce('wp_rest'),
					'site_url' => get_site_url(),
					'current_post_id' => $current_post_id,
					'current_term_id' => $current_term_id
				)
			);
		}
	}

	/**
	 * Initializing the block and its scripts
	 */
	public static function decent_comments_block_init() {
		$asset_file = include( plugin_dir_path( __FILE__ ) . 'decent-comments/build/index.asset.php' );
		wp_register_script(
			'decent-comments-block-editor',
			plugins_url( 'decent-comments/build/index.js', __FILE__ ),
			$asset_file['dependencies'],
			$asset_file['version']
		);

		wp_register_style(
			'decent-comments-block-editor',
			plugins_url( 'decent-comments/build/editor.css', __FILE__ ),
			array(),
			DECENT_COMMENTS_PLUGIN_VERSION
		);

		wp_enqueue_script(
			'decent-comments-block-editor'
		);

		wp_localize_script(
			'decent-comments-block-editor',
			'decentCommentsEdit',
			array(
				'nonce' => wp_create_nonce( 'wp_rest' ),
				'post_types' => self::get_post_types(),
				'current_id' => get_queried_object_id()
			)
		);

		wp_enqueue_script(
			'decent-comments-block-view',
			plugins_url( 'decent-comments/build/view.js', __FILE__),
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		wp_set_script_translations( 'decent-comments-block-editor', 'decent-comments', plugin_dir_path(__FILE__) . 'languages' );
		wp_set_script_translations( 'decent-comments-block-view', 'decent-comments', plugin_dir_path(__FILE__) . 'languages' );

		register_block_type(
			__DIR__ . '/decent-comments/build/block.json',
			array(
				'api_version' => '3',
				'style_handles' => array( 'decent-comments' ),
				'editor_script' => 'decent-comments-block-editor',
				'editor_style'  => 'decent-comments-block-editor',
				'attributes' => array(
					'title' => array(
						'type'    => 'string',
						'default' => ''
					),
					'number' => array(
						'type'    => 'number',
						'default' => 5,
					),
					'avatar_size' => array(
						'type'    => 'number',
						'default' => 32,
					),
					'exclude' => array(
						'type'    => 'string',
						'default' => '',
					),
					'show_avatar' => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'show_link' => array(
						'type'    => 'boolean',
						'default' => true,
					),
					'max_excerpt_words' => array(
						'type'    => 'number',
						'default' => 10,
					),
					'ellipsis' => array(
						'type'    => 'string',
						'default' => ''
					),
				),
			)
		);
	}

	/**
	 * Helper function to get available (public) post types as a comma-separated list.
	 *
	 * @return string
	 */
	private static function get_post_types() {
		return implode( ', ', get_post_types( array( 'public' => true ) ) );
	}

}

Decent_Comments_Blocks::init();
