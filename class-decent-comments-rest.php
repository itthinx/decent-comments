<?php
/**
 * Custom REST API endpoint for Decent Comments plugin
 * Integrates with class-decent-comments-renderer.php to fetch comments
 */

/**
 * Register the REST endpoint
 */

class Decent_Comments_Rest {

	public static function boot() {
		add_action( 'rest_api_init', array( __CLASS__, 'rest_api_init' ) );
	}

	public static function rest_api_init() {
		register_rest_route(
			'decent-comments/v1', '/comments', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( __CLASS__, 'decent_comments_rest_endpoint' ),
			'permission_callback' => '__return_true', // Public access; adjust as needed
			'args' => array(
				'number' => array(
					'default'           => 5,
					'minimum'           => 1,
					'required'          => false,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'description'       => __( 'Number of comments to return', 'decent-comments' ),
					'validate_callback' => 'rest_validate_request_arg'
				),
				'avatar_size' => array(
					'default'           => 48,
					'minimum'           => 24,
					'required'          => false,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'description'       => __( 'Size of author avatars in pixels', 'decent-comments' ),
					'validate_callback' => 'rest_validate_request_arg'
				),
				'post_id' => array(
					'default'           => '',
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'description'       => __( 'ID of the post to get comments for (0 for all posts)', 'decent-comments' ),
					'validate_callback' => 'rest_validate_request_arg'
				),
				/*'excerpt_length' => array(
					'default'           => 20,
					'required'          => false,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'description'       => 'Number of words for comment excerpts',
					'validate_callback' => 'rest_validate_request_arg'
				),*/
				'orderby' => array(
					'default'           => 'comment_author_email',
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'description'       => __( 'Sort comments by: date, author_email, author_url, content, karma, post', 'decent-comments' ),
					'enum'              => array(
						'comment_date_gmt',
						'comment_author_email',
						'comment_author_url',
						'comment_content',
						'comment_karma',
						'comment_post_id'
					),
					'validate_callback' => 'rest_validate_request_arg'
				),
				'order' => array(
					'default'           => 'desc',
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'description'       => __( 'Sort order: asc or desc', 'decent-comments' ),
					'enum'              => array('asc', 'desc'),
					'validate_callback' => 'rest_validate_request_arg'
				),
				'taxonomy' => array(
					'default'           => '',
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'description'       => __( 'Post category or tag', 'decent-comments' ),
					'validate_callback' => 'rest_validate_request_arg'
				),
				'terms' => array(
					'default'           => '',
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'description'       => __( 'Term ids or slugs', 'decent-comments' ),
					'validate_callback' => 'rest_validate_request_arg'
				),
				'exclude_post_author' => array(
					'default'           => false,
					'required'          => false,
					'type'              => 'boolean',
					'description'       => __( 'Exclude comments from post authors', 'decent-comments' ),
					'sanitize_callback' => array( __CLASS__, 'to_boolean' ),
					'validate_callback' => 'rest_validate_request_arg'
				),
				'pingback' => array(
					'default'           => true,
					'required'          => false,
					'type'              => 'boolean',
					'description'       => __( 'Whether to include Pingbacks', 'decent-comments' ),
					'sanitize_callback' => array( __CLASS__, 'to_boolean' ),
					'validate_callback' => 'rest_validate_request_arg'
				),
				'trackback' => array(
					'default'           => true,
					'required'          => false,
					'type'              => 'boolean',
					'description'       => __( 'Whether to include Trackbacks', 'decent-comments' ),
					'sanitize_callback' => array( __CLASS__, 'to_boolean' ),
					'validate_callback' => 'rest_validate_request_arg'
				)
			),
		));
	}

	/**
	 * Callback for the REST endpoint
	 *
	 * @param WP_REST_Request $request The REST request object
	 * @return WP_REST_Response|WP_Error
	 */
	public static function decent_comments_rest_endpoint( WP_REST_Request $request ) {
		$args = array(
			'number'              => $request->get_param( 'number' ),
			'avatar_size'         => $request->get_param( 'avatar_size' ),
			'post_id'             => $request->get_param( 'post_id' ),
			'post_type'           => $request->get_param( 'post_type' ),
			//'excerpt_length' => $request->get_param( 'excerpt_length' ),
			'orderby'             => $request->get_param( 'orderby' ),
			'order'               => $request->get_param( 'order' ) === 'asc' ? 'asc' : 'desc',
			'show_date'           => true, // Enable date display by default
			'show_author'         => true, // Enable author display
			'show_comment'        => true, // Enable comment content/excerpt
			'taxonomy'            => $request->get_param( 'taxonomy' ),
			'terms'               => $request->get_param( 'terms' ),
			'term_ids'            => $request->get_param( 'term_ids'),
			'pingback'            => $request->get_param( 'pingback' ),
			'trackback'           => $request->get_param( 'trackback' ),
			'exclude_post_author' => $request->get_param( 'exclude_post_author' )
		);

		// Parse the rendered HTML to extract comment data
		$comments_data = array();

		$taxonomy = !empty( $args['taxonomy'] ) ? $args['taxonomy'] : null;
		$term_ids = array();
		if ( isset( $args['terms'] ) && !empty( $taxonomy ) ) {
			if ( ( "{current}" == $args['terms'] ) || ( "[current]" == $args['terms'] ) ) {
				$args['terms'] = null;
				if ( $current_term = get_term_by( 'id', $args['term_ids'], $taxonomy ) ) {
					$term_ids[] = $current_term->term_id;
				}
			}
		}

		$comment_args = array(
			'number'    => $args['number'],
			'post_id'   => $args['post_id'],
			'post_type' => $args['post_type'],
			'taxonomy'  => $args['taxonomy'],
			'terms'     => $args['terms'],
			'term_ids'  => $term_ids,
			'pingback'  => $args['pingback'],
			'trackback' => $args['trackback'],
			'status'    => 'approve',
			'order'     => $args['order'],
			'orderby'   => $args['orderby'],
		);

		require_once( dirname( __FILE__ ) . '/class-decent-comment.php' );
		$comments = Decent_Comment::get_comments( $comment_args );

		if ( !empty( $comments ) ) {
			foreach ( $comments as $comment ) {
				$comment_data = array(
					'id'              => $comment->comment_ID,
					'author'          => $comment->comment_author,
					'author_email'    => $comment->comment_author_email,
					'author_url'      => $comment->comment_author_url,
					'date'            => $comment->comment_date,
					'content'         => $comment->comment_content,
					'avatar'          => get_avatar_url( $comment->comment_author_email, $args['avatar_size'] ),
					'comment_post_id' => $comment->comment_post_ID,
					'post_title'      => get_the_title( $comment->comment_post_ID ),
					'comment_link'    => get_comment_link( $comment->comment_ID ),
					'post_author'     => self::get_the_post_author_by_post_id( $comment->comment_post_ID ),
				);
				$comments_data[] = $comment_data;
			}
		}

		// Return response
		return new WP_REST_Response(
			array(
				'comments'   => $comments_data,
				'total'      => count($comments_data),
				'parameters' => $args,
			),
			200
		);

	}

	private static function get_the_post_author_by_post_id( $comment_post_id ) {
		$post_author_email = null;
		$post = get_post( $comment_post_id );
		if ( $post ) {
			$post_author_id = $post->post_author;
			$post_author_user = get_user( $post_author_id );
			if ( $post_author_user ) {
				$post_author_email = $post_author_user->user_email;
			}
		}

		return $post_author_email;
	}

	public static function to_boolean( $value, $default = false ) {
		if ( !is_bool( $default ) ) {
			$default = false;
		}
		if ( is_scalar( $value ) ) {
			if ( is_bool( $value ) ) {

			} else if ( is_int( $value ) ) {
				$value = $value !== 0;
			} else if ( is_string( $value ) ) {
				$value = strtolower( trim( $value ) );
				switch ( $value ) {
					case 'true':
					case '1':
					case 'yes':
						$value = true;
						break;
					case 'false':
					case '0':
					case 'no':
						$value = false;
						break;
					default:
						if ( is_numeric( $value ) ) {
							$value = intval( $value );
							$value = $value !== 0;
						} else {
							$value = $default;
						}
				}
			} else {
				$value = $default;
			}
		}
		return $value;
	}
} Decent_Comments_Rest::boot();
