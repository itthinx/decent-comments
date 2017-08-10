<?php
/**
 * class-decent-comments-renderer.php
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
 * @author Karim Rahimpur
 * @package decent-comments
 * @since decent-comments 1.0.0
 */

if ( !defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Comment Renderer.
 */
class Decent_Comments_Renderer {

	/**
	 * Default rendering options:
	 * ellipsis
	 * excerpt
	 * max_excerpt_words
	 * strip_tags
	 * ...
	 * 
	 * @var array
	 */
	static $defaults = array(
		//
		"ellipsis"          => "...",
		"excerpt"           => true,
		"max_excerpt_words" => 20,
		"max_excerpt_characters" => 0,
		"strip_tags"        => true,

		//
		"avatar_size"  => 24,
		"number"       => 5,
		"order"        => "DESC",
		"orderby"      => "comment_date_gmt",
		"show_author"  => true,
		"show_date"    => false,
		"link_author"  => true,
		"show_avatar"  => true,
		"show_link"    => true,
		"show_comment" => true,

		// taxonomy & term related, see the Decent_Comment class
		"taxonomy"     => null,
		"terms"        => null,
		'term_ids'     => null,

		// by post
		'post_id'      => null,

		// by post type
		'post_type'    => null,

		'pingback'     => true,
		'trackback'    => true,

		'exclude_post_author' => false
	);

	/**
	 * Allowed sort criteria and labels.
	 * @var array
	 */
	static $orderby_options;

	/**
	 * Allowed sort direction and labels.
	 * @var array
	 */
	static $order_options;

	/**
	 * Statics initialization.
	 */
	static function init() {
		self::$orderby_options = array(
			'comment_author_email' => __( 'Author Email', DC_PLUGIN_DOMAIN ),
			'comment_author_url'   => __( 'Author URL', DC_PLUGIN_DOMAIN ),
			'comment_content'      => __( 'Content', DC_PLUGIN_DOMAIN ),
			'comment_date_gmt'     => __( 'Date', DC_PLUGIN_DOMAIN ),
			'comment_karma'        => __( 'Karma', DC_PLUGIN_DOMAIN ),
			'comment_post_ID'      => __( 'Post', DC_PLUGIN_DOMAIN )
		);
		self::$order_options = array(
			'ASC'  => __( 'Ascending', DC_PLUGIN_DOMAIN ),
			'DESC' => __( 'Descending', DC_PLUGIN_DOMAIN )
		);
	}

	/** 
	 * Renders a comment according to the $options given.
	 * 
	 * @param int $comment_ID the comment ID
	 * @param array $options used to specify rendering settings, defaults apply if none given
	 * @return rendered comment
	 * @see Decent_Comments_Renderer::$defaults
	 */
	static function get_comment( $comment_ID = 0, $options = array() ) {

		$ellipsis = self::$defaults['ellipsis'];
		if ( isset( $options["ellipsis"] ) ) {
			$ellipsis = wp_filter_kses( addslashes( $options["ellipsis"] ) );
		}
		$excerpt = self::$defaults['excerpt'];
		if ( isset( $options["excerpt"] ) ) {
			$excerpt = $options["excerpt"] !== false;
		}
		$max_excerpt_words = self::$defaults['max_excerpt_words'];
		if ( isset( $options["max_excerpt_words"] ) ) {
			$max_excerpt_words = intval( $options["max_excerpt_words"] );
		}
		$max_excerpt_characters = self::$defaults['max_excerpt_characters'];
		if ( isset( $options['max_excerpt_characters'] ) ) {
			$max_excerpt_characters = intval( $options['max_excerpt_characters'] );
		}
		$strip_tags = self::$defaults['strip_tags'];
		if ( isset( $options["strip_tags"] ) ) {
			$strip_tags =  $options["strip_tags"] !== false;
		}

		$output = "";

		$comment = get_comment( $comment_ID );

		if ( $comment ) {

			if ( $strip_tags ) {
				$content = strip_tags( $comment->comment_content );
			} else {
				$content = $comment->comment_content;
			}

			// guard against shortcodes in comments
			$content = str_replace( "[", "&#91;", $content );
			$content = str_replace( "]", "&#93;", $content );

			if ( $excerpt ) {
				// word limit
				$content = preg_replace( "/\s+/", " ", $content );
				$words = explode( " ", $content );
				$nwords = count( $words );
				for ( $i = 0; ( $i < $max_excerpt_words ) && ( $i < $nwords ); $i++ ) {
					$output .= $words[$i];
					if ( $i < $max_excerpt_words - 1) {
						$output .= " ";
					} else {
						$output .= $ellipsis;
					}
				}
				// character limit
				if ( $max_excerpt_characters > 0 ) {
					if ( function_exists( 'mb_substr' ) ) {
						$charset = get_bloginfo( 'charset' );
						$length = mb_strlen( $output, $charset );
						$output = mb_substr( $output, 0, $max_excerpt_characters, $charset );
						if ( mb_strlen( $output ) < $length ) {
							$output .= $ellipsis;
						}
					} else {
						$length = strlen( $output );
						$output = substr( $output, 0, $max_excerpt_characters );
						if ( strlen( $output ) < $length ) {
							$output .= $ellipsis;
						}
					}
				}
			} else {
				$output = $content;
			}
		}
		return apply_filters( 'decent_comments_comment_output', $output, $comment_ID, $options );
	}

	/**
	 * Renders comments.
	 * 
	 * These options defined in Decent_Comments_Renderer::$defaults are supported.
	 * @see Decent_Comments_Renderer::$defaults
	 * 
	 * @param array $options determines what settings are used to render which comments
	 * @return rendered comments
	 * @uses Decent_Comments_Renderer::get_comment()
	 */
	static function get_comments( $options = array() ) {

		// output
		$output = '';

		extract( self::$defaults );

		// comment selection options
		if ( isset( $options['number'] ) ) {
			$number = intval( $options['number'] );
		}
		if ( isset( $options['order'] ) ) {
			$order = ( 'ASC' == strtoupper( $options['order'] ) ) ? 'ASC' : 'DESC';
		}
		if ( isset( $options['orderby'] ) ) {
			$orderby = $options['orderby'];
		}
		if ( isset( $options['post_id'] ) && ( $options['post_id'] !== null ) ) {
			if ( ( "{current}" == $options['post_id'] ) || ( "[current]" == $options['post_id'] ) ) {
				$post_id = get_the_ID();
			} else if ( $post = get_post( $options['post_id'] ) ) {
				$post_id = $post->ID;
			}
		}

		if ( isset( $options['post_type'] ) ) {
			$post_types = get_post_types( array( 'public' => true ) );
			$options['post_type'] = array_map( 'trim', explode( ',', $options['post_type'] ) );
			if ( count( $options['post_type'] ) < 2 ) {
				$options['post_type'] = array_shift( $options['post_type'] );
			}
			if ( is_array( $options['post_type'] ) ) {
				$post_type = array();
				$_post_types = $options['post_type'];
				foreach( $_post_types as $_post_type ) {
					$_post_type = trim( $_post_type );
					if ( in_array( $_post_type, $post_types ) ) {
						$post_type[] = $_post_type;
					}
				}
				if ( empty( $post_type ) ) {
					$post_type = null;
				}
			} else {
				$post_type = trim( $options['post_type'] );
				if ( !in_array( $post_type, $post_types ) ) {
					$post_type = null;
				}
			}
		}

		// Any chosen terms? - Needs taxonomy to be given as well.
		if ( isset( $options['terms'] ) ) {
			$terms = $options['terms'];
		}
		// Any term ids given? - Needs taxonomy to be given as well.
		if ( isset( $options['term_ids'] ) ) {
			$term_ids = $options['term_ids'];
		}
		// What taxonomy? - {current} will void $terms and $term_ids above and
		// replace with those related to current post if any.
		$taxonomy = !empty( $options['taxonomy'] ) ? $options['taxonomy'] : self::$defaults['taxonomy']; 
		if ( isset( $options['terms'] ) && !empty( $taxonomy ) ) {
			// If the {current} option is used, get the current post's terms
			// and use their ids to look for comments on posts that are
			// related to the same terms.
			if ( ( "{current}" == $options['terms'] ) || ( "[current]" == $options['terms'] ) ) {
				// limit to term ids
				$terms = null;
				$foo = get_the_ID();
				$term_ids = array();
				// build term ids
				if ( $current_terms = get_the_terms( get_the_ID(), $taxonomy ) ) {
					foreach ( $current_terms as $term ) {
						$term_ids[] = $term->term_id;
					}
				}
			}
		}
		if ( isset( $options['pingback'] ) ) {
			$pingback = ( $options['pingback'] !== 'false' && $options['pingback'] !== false );
		}
		if ( isset( $options['trackback'] ) ) {
			$trackback = ( $options['trackback'] === 'false' && $options['pingback'] !== false );
		}

		if ( isset( $options['exclude_post_author'] ) ) {
			$exclude_post_author = $options['exclude_post_author'] === 'true' || $options['exclude_post_author'] === true;
		}

		// basic options: number, sort, comments must be approved
		$comment_args = array(
			'number'  => $number,
			'order'   => $order,
			'orderby' => $orderby,
			'status'  => 'approve'
		);
		// comments for a specific post
		if ( isset( $post_id ) ) {
			$comment_args['post_id'] = $post_id;
		}
		// comments for a specific post type
		if ( !empty( $post_type ) ) {
			$comment_args['post_type'] = $post_type;
		}
		// comments related to taxonomies & terms
		if ( !empty( $taxonomy ) ) {
			$comment_args['taxonomy'] = $taxonomy;
		}
		if ( !empty( $terms ) ) {
			$comment_args['terms'] = $terms;
		}
		if ( !empty( $term_ids ) ) {
			$comment_args['term_ids'] = $term_ids;
		}
		if ( isset( $pingback ) ) {
			$comment_args['pingback'] = $pingback;
		}
		if ( isset( $trackback ) ) {
			$comment_args['trackback'] = $trackback;
		}
		if ( isset( $exclude_post_author ) ) {
			$comment_args['exclude_post_author'] = $exclude_post_author;
		}

		require_once( dirname( __FILE__ ) . '/class-decent-comment.php' );
		$comments = Decent_Comment::get_comments( $comment_args );

		if ( !empty( $comments ) ) {

			// display options
			if ( isset( $options['avatar_size'] ) ) {
				$avatar_size = intval( $options['avatar_size'] );
			}
			if ( isset( $options['excerpt'] ) ) {
				$excerpt = ( $options['excerpt'] !== 'false' && $options['excerpt'] !== false );
			}
			if ( isset( $options['max_excerpt_words'] ) ) {
				$max_excerpt_words = intval( $options['max_excerpt_words'] );
			}
			if ( isset( $options['max_excerpt_characters'] ) ) {
				$max_excerpt_characters = intval( $options['max_excerpt_characters'] );
			}
			if ( isset( $options['ellipsis'] ) ) {
				$ellipsis = $options['ellipsis'];
			}
			if ( isset( $options['show_author'] ) ) {
				$show_author = ( $options['show_author'] !== 'false' && $options['show_author'] !== false );
			}
			if ( isset( $options['show_date'] ) ) {
				$show_date = ( $options['show_date'] !== 'false' && $options['show_date'] !== false );
			}
			if ( isset( $options['link_author'] ) ) {
				$link_author = ( $options['link_author'] !== 'false' && $options['link_author'] !== false );
			}
			if ( isset( $options['show_avatar'] ) ) {
				$show_avatar = ( $options['show_avatar'] !== 'false' && $options['show_avatar'] !== false );
			}
			if ( isset( $options['show_link'] ) ) {
				$show_link = ( $options['show_link'] !== 'false' && $options['show_link'] !== false );
			}
			if ( isset( $options['show_comment'] ) ) {
				$show_comment = ( $options['show_comment'] !== 'false' && $options['show_comment'] !== false );
			}
			if ( isset( $options['strip_tags'] ) ) {
				$strip_tags = ( $options['strip_tags'] !== 'false' && $options['strip_tags'] !== false );
			}

			$output .= '<div class="decent-comments">';
			$output .= '<ul>';

			foreach ( $comments as $comment) {

				$output .= '<li>';

				$output .= '<div class="comment">';

				if ( $show_avatar ) {
					$output .= '<span class="comment-avatar">';
					$comment_author_url = get_comment_author_url( $comment->comment_ID );
					if ( !empty( $comment_author_url ) && $link_author ) {
						$output .= '<a href="'. $comment_author_url . '" rel="external">';
					}
					$output .= get_avatar( $comment->comment_author_email, $avatar_size );
					if ( !empty( $comment_author_url ) ) {
						$output .= '</a>';
					}
					$output .= '</span>'; // .comment-avatar
				}

				if ( $show_author ) {
					$output .= '<span class="comment-author">';
					if ( $link_author ) {
						$output .= get_comment_author_link( $comment->comment_ID );
					} else {
						$output .= get_comment_author( $comment->comment_ID );
					}
					$output .= '</span>'; // .comment-author
				}

				if ( $show_date ) {
					$output .= '<span class="comment-date">';
					$output .= sprintf(
						_x( ' %1$s at %2$s', 'comment-date', DC_PLUGIN_DOMAIN ), // translators : the first argument is the date of the comment, the second is the time
						mysql2date( get_option( 'date_format' ), $comment->comment_date ),
						mysql2date( get_option( 'time_format' ), $comment->comment_date, true )
					);
					$output .= '</span>'; // .comment-date
				}

				if ( $show_link ) {
					$output .= '<span class="comment-link">';
					$output .= sprintf(
						_x( ' on %s', 'comment-link', DC_PLUGIN_DOMAIN ),
						'<a href="' . esc_url( get_comment_link( $comment->comment_ID ) ) . '">' . get_the_title( $comment->comment_post_ID ) . '</a>'
					);
					$output .= '</span>'; // .comment-link
				}

				if ( $show_comment ) {
					$output .= '<span class="comment-' . ( $excerpt ? "excerpt" : "body" ) . '">';
					$output .= self::get_comment(
						$comment,
						array(
							'ellipsis' => $ellipsis,
							'excerpt' => $excerpt,
							'max_excerpt_words' => $max_excerpt_words,
							'max_excerpt_characters' => $max_excerpt_characters,
							'strip_tags' => $strip_tags
						)
					);
					$output .= '</span>'; // .comment-body or .comment-excerpt
				}

				$output .= '</div>'; // .comment

				$output .= '</li>';
			}

			$output .= '</ul>';
			$output .= '</div>'; // .decent-comments
 		}
		return apply_filters( 'decent_comments_comments_output', $output, $comments, $options );
	}
} // class Decent_Comments_Renderer

Decent_Comments_Renderer::init();
