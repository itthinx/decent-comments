<?php
/**
 * class-decent-comments-widget.php
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
 * @link https://codex.wordpress.org/Widgets_API#Developing_Widgets
 */

if ( !defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Versatile comments widget.
 */
class Decent_Comments_Widget extends WP_Widget {

	/**
	 * Widget name
	 *
	 * @since 1.12.0
	 *
	 * @var string
	 */
	const DECENT_COMMENTS_WIDGET_NAME = 'Decent Comments';

	/**
	 * @var string cache group
	 */
	public static $cache_group = 'decent_comments_widget';

	/**
	 * @var string cache flag
	 */
	public static $cache_expire = 3600;

	/**
	 * Initialize class.
	 */
	public static function init() {
		if ( !has_action( 'wp_print_styles', array( __CLASS__, '_wp_print_styles' ) ) ) {
			add_action( 'wp_print_styles', array( __CLASS__, '_wp_print_styles' ) );
		}
		if ( !has_action( 'comment_post', array( __CLASS__, 'comment_post' ) ) ) {
			add_action( 'comment_post', array( __CLASS__, 'comment_post' ), 10, 3 );
		}
		if ( !has_action( 'transition_comment_status', array( __CLASS__, 'transition_comment_status' ) ) ) {
			add_action( 'transition_comment_status', array( __CLASS__, 'transition_comment_status' ), 10, 3 );
		}
	}

	/**
	 * Purge widgets cached on new approved comments.
	 *
	 * @since 1.12.0
	 *
	 * @param int $comment_ID
	 * @param int|string $comment_approved
	 * @param array $commentdata
	 */
	public static function comment_post( $comment_ID, $comment_approved, $commentdata ) {
		if ( $comment_approved === 1 ) {
			self::purge_widget_caches();
		}
	}

	/**
	 * Purge widgets cached on comment status changes.
	 *
	 * @since 1.12.0
	 *
	 * @param int|string $new_status
	 * @param int|string $old_status
	 * @param WP_Comment $comment
	 */
	public static function transition_comment_status( $new_status, $old_status, $comment ) {
		if ( $new_status !== $old_status ) {
			self::purge_widget_caches();
		}
	}

	/**
	 * Purge cached data for this class' widgets.
	 *
	 * @since 1.12.0
	 */
	public static function purge_widget_caches() {

		global $wp_registered_sidebars, $wp_registered_widgets;

		$sidebars_widgets = wp_get_sidebars_widgets();
		foreach ( $sidebars_widgets as $sidebar => $ids ) {
			if ( $sidebar !== 'wp_inactive_widgets' ) {
				if ( is_array( $ids ) ) {
					foreach ( $ids as $id ) {
						if ( isset( $wp_registered_widgets[$id] ) ) {
							if ( isset( $wp_registered_widgets[$id]['name'] ) ) {
								if ( $wp_registered_widgets[$id]['name'] === self::DECENT_COMMENTS_WIDGET_NAME ) {
									self::cache_delete( $id );
								}
							}
						}
					}
				}
			}
		}
	}

	/**
	 * Creates a Decent Comments widget.
	 */
	public function __construct() {
		parent::__construct( false, $name = self::DECENT_COMMENTS_WIDGET_NAME );
	}

	/**
	 * Returns the cache key based on the given $widget_id, the current user's roles and groups.
	 * For plain visitors, this returns the $widget_id.
	 * This returns null if the $widget_id is null.
	 *
	 * @since 1.11.0
	 *
	 * @param string $widget_id
	 *
	 * @return string|null
	 */
	private static function get_cache_key( $widget_id = null ) {
		$cache_key = $widget_id;
		if ( $widget_id !== null ) {
			if ( is_user_logged_in() ) {
				$user = wp_get_current_user();
				$roles = $user->roles;
				if ( is_array( $roles ) ) {
					sort( $roles );
				} else {
					$roles = array();
				}
				if ( class_exists( 'Groups_User' ) ) {
					$groups_user = new Groups_User( $user->ID );
					$group_ids = $groups_user->group_ids_deep;
					$group_ids = array_map( 'intval', $group_ids );
					sort( $group_ids, SORT_NUMERIC );
				} else {
					$group_ids = array();
				}
				if ( count( $roles ) > 0 ) {
					$cache_key .= '-' . implode( '.', $roles );
				}
				if ( count( $group_ids ) > 0 ) {
					$cache_key .= '-' . implode( '.', $group_ids );
				}
			}
		}
		return $cache_key;
	}

	/**
	 * Clears cached widget content.
	 *
	 * @param string $widget_id
	 */
	public static function cache_delete( $widget_id = null ) {
		if ( $widget_id !== null ) {
			wp_cache_delete( self::get_cache_key( $widget_id ), self::$cache_group );
		}
	}

	/**
	 * Returns cached content for the widget.
	 *
	 * @since 1.11.0
	 *
	 * @param string $widget_id
	 *
	 * @return string|null
	 */
	public static function cache_get( $widget_id = null ) {
		$content = null;
		if ( $widget_id !== null ) {
			$found = null;
			$cached = wp_cache_get( self::get_cache_key( $widget_id ), self::$cache_group, false, $found );
			if ( $found ) {
				$content = $cached;
			}
		}
		return $content;
	}

	/**
	 * Sets cached content for the widget.
	 *
	 * @since 1.11.0
	 *
	 * @param string $widget_id
	 * @param string $content
	 */
	public static function cache_set( $widget_id = null, $content = null ) {
		if ( $widget_id !== null ) {
			$cache_expire = apply_filters( 'decent_comments_widget_cache_expire', self::$cache_expire );
			if ( !is_numeric( $cache_expire ) || $cache_expire < 0 ) {
				$cache_expire = 0;
			}
			wp_cache_set(
				self::get_cache_key( $widget_id ),
				$content,
				self::$cache_group,
				$cache_expire
			);
		}
	}

	/**
	 * Enqueue styles if at least one widget is used.
	 */
	public static function _wp_print_styles() {
		global $wp_registered_widgets, $DC_version;
		foreach ( $wp_registered_widgets as $widget ) {
			if ( $widget['name'] === self::DECENT_COMMENTS_WIDGET_NAME ) {
				wp_enqueue_style( 'decent-comments-widget', DC_PLUGIN_URL . 'css/decent-comments-widget.css', array(), $DC_version );
				break;
			}
		}
	}

	/**
	 * Widget output
	 *
	 * @see WP_Widget::widget()
	 */
	public function widget( $args, $instance ) {

		if ( ! isset( $args['widget_id'] ) ) {
			$args['widget_id'] = $this->id;
		}
		$widget_id = $args['widget_id'];

		$before_widget = isset( $args['before_widget'] ) && is_string( $args['before_widget'] ) ? $args['before_widget'] : '';
		$after_widget = isset( $args['after_widget'] ) && is_string( $args['after_widget'] ) ? $args['after_widget'] : '';

		$before_title = isset( $args['before_title'] ) && is_string( $args['before_title'] ) ? $args['before_title'] : '';
		$after_title = isset( $args['after_title'] ) && is_string( $args['after_title'] ) ? $args['after_title'] : '';

		$cached = self::cache_get( $widget_id );
		if ( $cached !== null ) {
			return $cached;
		}

		$title = apply_filters( 'widget_title', isset( $instance['title'] ) ? $instance['title'] : '' );

		// render the widget's content
		$output = $before_widget;
		if ( !empty( $title ) ) {
			$output .= $before_title . $title . $after_title;
		}
		$output .= Decent_Comments_Renderer::get_comments( $instance );
		$output .= $after_widget;

		self::cache_set( $widget_id, $output );

		echo $output;
	}

	/**
	 * Save widget options
	 *
	 * @see WP_Widget::update()
	 */
	public function update( $new_instance, $old_instance ) {

		global $wpdb;

		$settings = $old_instance;

		// title
		$settings['title'] = strip_tags( $new_instance['title'] );

		// number
		$number = isset( $new_instance['number'] ) ? intval( $new_instance['number'] ) : 0;
		if ( $number > 0 ) {
			$settings['number'] = $number;
		} else {
			unset( $settings['number'] );
		}

		// orderby
		$orderby = isset( $new_instance['orderby'] ) ? $new_instance['orderby'] : null;
		if ( key_exists( $orderby, Decent_Comments_Renderer::$orderby_options ) ) {
			$settings['orderby'] = $orderby;
		} else {
			unset( $settings['orderby'] );
		}

		// order
		$order = isset( $new_instance['order'] ) ? $new_instance['order'] : null;
		if ( key_exists( $order, Decent_Comments_Renderer::$order_options ) ) {
			$settings['order'] = $order;
		} else {
			unset( $settings['order'] );
		}

		// post_id
		$post_id = isset( $new_instance['post_id'] ) ? $new_instance['post_id'] : null;
		if ( empty( $post_id ) ) {
			unset( $settings['post_id'] );
		} else if ( ( "[current]" == $post_id ) || ( "{current}" == $post_id ) )  {
			$settings['post_id'] = "{current}";
		} else if ( $post = get_post( $post_id ) ) {
			$settings['post_id'] = $post->ID;
		} else if ( $post = Decent_Comments_Helper::get_post_by_title( $post_id ) ) {
			$settings['post_id'] = $post->ID;
		}

		// post type
		$post_type = isset( $new_instance['post_type'] ) ? $new_instance['post_type'] : null;
		if ( !empty( $post_type ) ) {
			$post_type = implode( ',', array_map( 'trim', explode( ',', $post_type ) ) );
			$settings['post_type'] = $post_type;
		}
		if ( empty( $post_type ) ) {
			unset( $settings['post_type'] );
		}

		// exclude_post_author
		$settings['exclude_post_author'] = !empty( $new_instance['exclude_post_author'] );

		// excerpt
		$settings['excerpt'] = !empty( $new_instance['excerpt'] );

		// max_excerpt_words
		$max_excerpt_words = isset( $new_instance['max_excerpt_words'] ) ? intval( $new_instance['max_excerpt_words'] ) : 0;
		if ( $max_excerpt_words > 0 ) {
			$settings['max_excerpt_words'] = $max_excerpt_words;
		} else {
			unset( $settings['max_excerpt_words'] );
		}

		// max_excerpt_characters
		$max_excerpt_characters = isset( $new_instance['max_excerpt_characters'] ) ? intval( $new_instance['max_excerpt_characters'] ) : 0;
		if ( $max_excerpt_characters >= 0 ) {
			$settings['max_excerpt_characters'] = $max_excerpt_characters;
		} else {
			unset( $settings['max_excerpt_characters'] );
		}

		// ellipsis
		$settings['ellipsis'] = isset( $new_instance['ellipsis'] ) ? strip_tags( $new_instance['ellipsis'] ) : '';

		// show_author
		$settings['show_author'] = !empty( $new_instance['show_author'] );

		// show the comment date
		$settings['show_date'] = !empty( $new_instance['show_date'] );

		// link_author
		$settings['link_author'] = !empty( $new_instance['link_author'] );

		// show_avatar
		$settings['show_avatar'] = !empty( $new_instance['show_avatar'] );

		// avatar_size
		$avatar_size = isset( $new_instance['avatar_size'] ) ? intval( $new_instance['avatar_size'] ) : 0;
		if ( $avatar_size > 0 ) {
			$settings['avatar_size'] = $avatar_size;
		} else {
			unset( $settings['avatar_size'] );
		}

		// show_link
		$settings['show_link'] = !empty( $new_instance['show_link'] );

		// show_comment
		$settings['show_comment'] = !empty( $new_instance['show_comment'] );

		// accept terms on a taxonomy
		// this only allows terms if there is a taxonomy
		if ( isset( $new_instance['taxonomy'] ) ) {
			if ( $taxonomy = get_taxonomy( $new_instance['taxonomy'] ) ) {
				$settings['taxonomy'] = $new_instance['taxonomy'];
				if ( isset( $new_instance['terms'] ) ) {
					if ( $new_instance['terms'] !== '{current}' ) {
						// let's see if those slugs are ok
						$slugs = explode( ",", $new_instance['terms'] );
						$slugs_ = array();
						foreach( $slugs as $slug ) {
							$slug = trim( $slug );
							$slug_ = $wpdb->get_var( $wpdb->prepare( "SELECT slug FROM $wpdb->terms LEFT JOIN $wpdb->term_taxonomy ON $wpdb->terms.term_id = $wpdb->term_taxonomy.term_id WHERE slug = %s AND taxonomy = %s", $slug, $new_instance['taxonomy'] ) );
							if ( $slug_ === $slug ) {
								$slugs_[] = $slug;
							}
						}
						if ( count( $slugs_ ) > 0 ) {
							$settings['terms'] = implode( ",", $slugs_ );
						} else {
							unset( $settings['terms'] );
						}
					} else {
						$settings['terms'] = '{current}';
					}
				} else {
					unset( $settings['terms'] );
				}
			} else {
				unset( $settings['taxonomy'] );
			}
		} else {
			unset( $settings['taxonomy'] );
		}

		// pingback, trackback
		$settings['pingback'] = !empty( $new_instance['pingback'] );
		$settings['trackback'] = !empty( $new_instance['trackback'] );

		self::cache_delete( $this->id );

		return $settings;
	}

	/**
	 * Output admin widget options form
	 *
	 * @see WP_Widget::form()
	 */
	public function form( $instance ) {

		extract( Decent_Comments_Renderer::$defaults );

		echo '<p style="border-bottom: 1px solid #999; margin-bottom: 8px; padding-bottom: 8px; font-weight: 600;">';
		printf( esc_html__( 'Thanks for supporting our work with a purchase in our %sShop%s!' ), '<a href="' . esc_url( 'https://www.itthinx.com/shop/>' ) . '">', '</a>' );
		echo '</p>';

		// title
		$title = isset( $instance['title'] ) ? $instance['title'] : "";
		echo "<p>";
		echo '<label for="' .$this->get_field_id( 'title' ) . '">' . esc_html__( 'Title', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '<input class="widefat" id="' . $this->get_field_id( 'title' ) . '" name="' . $this->get_field_name( 'title' ) . '" type="text" value="' . esc_attr( $title ) . '" />';
		echo '</p>';

		// number
		$number = isset( $instance['number'] ) ? intval( $instance['number'] ) : '';
		echo "<p>";
		echo '<label class="title" title="' . esc_html__( "The number of comments to show.", DC_PLUGIN_DOMAIN ) .'" for="' .$this->get_field_id( 'number' ) . '">' . esc_html__( 'Number of comments', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '<input class="widefat" id="' . $this->get_field_id( 'number' ) . '" name="' . $this->get_field_name( 'number' ) . '" type="text" value="' . esc_attr( $number ) . '" />';
		echo '</p>';

		// orderby
		$orderby = isset( $instance['orderby'] ) ? $instance['orderby'] : '';
		echo '<p>';
		echo '<label class="title" title="' . esc_html__( "Sorting criteria.", DC_PLUGIN_DOMAIN ) .'" for="' .$this->get_field_id( 'orderby' ) . '">' . esc_html__( 'Order by ...', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '<select class="widefat" name="' . $this->get_field_name( 'orderby' ) . '">';
		foreach ( Decent_Comments_Renderer::$orderby_options as $orderby_option_key => $orderby_option_name ) {
			$selected = ( $orderby_option_key == $orderby ? ' selected="selected" ' : "" );
			echo '<option ' . $selected . 'value="' . $orderby_option_key . '">' . $orderby_option_name . '</option>';
		}
		echo '</select>';
		echo '</p>';

		// order
		$order = isset( $instance['order'] ) ? $instance['order'] : '';
		echo '<p>';
		echo '<label class="title" title="' . esc_html__( "Sort order.", DC_PLUGIN_DOMAIN ) .'" for="' .$this->get_field_id( 'order' ) . '">' . esc_html__( 'Sort order', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '<select class="widefat" name="' . $this->get_field_name( 'order' ) . '">';
		foreach ( Decent_Comments_Renderer::$order_options as $order_option_key => $order_option_name ) {
			$selected = ( $order_option_key == $order ? ' selected="selected" ' : "" );
			echo '<option ' . $selected . 'value="' . $order_option_key . '">' . $order_option_name . '</option>';
		}
		echo '</select>';
		echo '</p>';

		// post_id
		$post_id = '';
		if ( isset( $instance['post_id'] ) ) {
			if ( ( '[current]' == strtolower( $instance['post_id'] ) ) || ( '{current}' == strtolower( $instance['post_id'] ) ) ) {
				$post_id = '{current}';
			} else {
				$post_id = $instance['post_id'];
			}
		}
		echo "<p>";
		echo '<label class="title" title="' . esc_html__( "Leave empty to show comments for all posts. To show comments for a specific post only, indicate either part of the title or the post ID. To show posts for the current post, indicate: [current]", DC_PLUGIN_DOMAIN ) . '" for="' .$this->get_field_id( 'post_id' ) . '">' . esc_html__( 'Post ID', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '<input class="widefat" id="' . $this->get_field_id( 'post_id' ) . '" name="' . $this->get_field_name( 'post_id' ) . '" type="text" value="' . esc_attr( $post_id ) . '" />';
		echo '<br/>';
		echo '<span class="description">' . esc_html__( "Title, empty, post ID or [current]", DC_PLUGIN_DOMAIN ) . '</span>';
		if ( !empty( $post_id ) && ( $post_title = get_the_title( $post_id ) ) ) {
			echo '<br/>';
			echo '<span class="description"> ' . sprintf( esc_html__( 'Selected post: <em>%s</em>', DC_PLUGIN_DOMAIN ) , $post_title ) . '</span>';
		}
		echo '</p>';

		// post type
		$post_types = get_post_types( array( 'public' => true ) );
		$post_type = '';
		if ( !empty( $instance['post_type'] ) ) {
			$post_type = $instance['post_type'];
		}
		echo '<p>';
		printf(
			'<label class="title" title="%s" for="%s">%s</label>',
			esc_attr(
				esc_html__( 'Leave empty to show comments for all post types. To show comments for a specific post type only, indicate the post type.', DC_PLUGIN_DOMAIN ) .
				' ' .
				esc_html__( 'You can indicate one ore more post types separated by comma.', DC_PLUGIN_DOMAIN )
			),
			esc_attr( $this->get_field_id( 'post_type' ) ),
			esc_html( esc_html__( 'Post Type', DC_PLUGIN_DOMAIN ) )
		);
		echo '<input class="widefat" id="' . $this->get_field_id( 'post_type' ) . '" name="' . $this->get_field_name( 'post_type' ) . '" type="text" value="' . esc_attr( $post_type ) . '" />';
		echo '<br/>';
		echo '<span class="description">' . sprintf( esc_html__( "Available post types: %s", DC_PLUGIN_DOMAIN ), implode( ', ', $post_types ) ) . '</span>';
		echo '</p>';

		// exclude_post_author
		$checked = ( (
			( !isset( $instance['exclude_post_author'] ) && Decent_Comments_Renderer::$defaults['exclude_post_author'] ) ||
			( isset( $instance['exclude_post_author'] ) && $instance['exclude_post_author'] === true ) )
			? 'checked="checked"' : '' );
		echo '<p>';
		echo '<input type="checkbox" ' . $checked . ' value="1" name="' . $this->get_field_name( 'exclude_post_author' ) . '" />';
		echo '<label class="title" title="' . esc_html__( "If checked, excludes comments from post authors on their own posts.", DC_PLUGIN_DOMAIN ) .'" for="' . $this->get_field_id( 'exclude_post_author' ) . '">' . esc_html__( 'Exclude comments from post authors', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '</p>';

		// excerpt
		$checked = ( ( ( !isset( $instance['excerpt'] ) && Decent_Comments_Renderer::$defaults['excerpt'] ) || ( isset( $instance['excerpt'] ) && $instance['excerpt'] === true ) ) ? 'checked="checked"' : '' );
		echo '<p>';
		echo '<input type="checkbox" ' . $checked . ' value="1" name="' . $this->get_field_name( 'excerpt' ) . '" />';
		echo '<label class="title" title="' . esc_html__( "If checked, shows an excerpt of the comment. Otherwise the full text of the comment is displayed.", DC_PLUGIN_DOMAIN ) .'" for="' . $this->get_field_id( 'excerpt' ) . '">' . esc_html__( 'Show comment excerpt', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '</p>';

		// max_excerpt_words
		$max_excerpt_words = !empty( $instance['max_excerpt_words'] ) ? intval( $instance['max_excerpt_words'] ) : '';
		echo "<p>";
		echo '<label class="title" title="' . esc_html__( "The maximum number of words shown in excerpts.", DC_PLUGIN_DOMAIN ) .'" for="' .$this->get_field_id( 'max_excerpt_words' ) . '">' . esc_html__( 'Number of words in excerpts', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '<input class="widefat" id="' . $this->get_field_id( 'max_excerpt_words' ) . '" name="' . $this->get_field_name( 'max_excerpt_words' ) . '" type="text" value="' . esc_attr( $max_excerpt_words ) . '" />';
		echo '</p>';

		// max_excerpt_characters
		$max_excerpt_characters = !empty( $instance['max_excerpt_characters'] ) ? intval( $instance['max_excerpt_characters'] ) : '';
		echo "<p>";
		echo '<label class="title" title="' . esc_html__( "The maximum number of characters shown in excerpts.", DC_PLUGIN_DOMAIN ) .'" for="' .$this->get_field_id( 'max_excerpt_characters' ) . '">' . esc_html__( 'Number of characters in excerpts', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '<input class="widefat" id="' . $this->get_field_id( 'max_excerpt_characters' ) . '" name="' . $this->get_field_name( 'max_excerpt_characters' ) . '" type="text" value="' . esc_attr( $max_excerpt_characters ) . '" />';
		echo '</p>';

		// ellipsis
		$ellipsis = isset( $instance['ellipsis'] ) ? $instance['ellipsis'] : '';
		echo "<p>";
		echo '<label class="title" title="' . esc_html__( "The ellipsis is shown after the excerpt when there is more content.", DC_PLUGIN_DOMAIN ) . '" for="' .$this->get_field_id( 'ellipsis' ) . '">' . esc_html__( 'Ellipsis', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '<input class="widefat" id="' . $this->get_field_id( 'ellipsis' ) . '" name="' . $this->get_field_name( 'ellipsis' ) . '" type="text" value="' . esc_attr( $ellipsis ) . '" />';
		echo '</p>';

		// show_author
		$checked = ( ( ( !isset( $instance['show_author'] ) && Decent_Comments_Renderer::$defaults['show_author'] ) || ( isset( $instance['show_author'] ) && $instance['show_author'] === true ) ) ? 'checked="checked"' : '' );
		echo '<p>';
		echo '<input type="checkbox" ' . $checked . ' value="1" name="' . $this->get_field_name( 'show_author' ) . '" />';
		echo '<label class="title" title="' . esc_html__( "Whether to show the author of each comment.", DC_PLUGIN_DOMAIN ) .'" for="' . $this->get_field_id( 'show_author' ) . '">' . esc_html__( 'Show author', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '</p>';

		// show_date
		$checked = ( ( ( !isset( $instance['show_date'] ) && Decent_Comments_Renderer::$defaults['show_date'] ) || ( isset( $instance['show_date'] ) && $instance['show_date'] === true ) ) ? 'checked="checked"' : '' );
		echo '<p>';
		echo '<input type="checkbox" ' . $checked . ' value="1" name="' . $this->get_field_name( 'show_date' ) . '" />';
		echo '<label class="title" title="' . esc_html__( "Show the date and time when the comment was posted.", DC_PLUGIN_DOMAIN ) .'" for="' . $this->get_field_id( 'show_date' ) . '">' . esc_html__( 'Show date', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '</p>';

		// link_author
		$checked = ( ( ( !isset( $instance['link_author'] ) && Decent_Comments_Renderer::$defaults['link_author'] ) || ( isset( $instance['link_author'] ) && $instance['link_author'] === true ) ) ? 'checked="checked"' : '' );
		echo '<p>';
		echo '<input type="checkbox" ' . $checked . ' value="1" name="' . $this->get_field_name( 'link_author' ) . '" />';
		echo '<label class="title" title="' . esc_html__( "Whether to link comment authors to their website.", DC_PLUGIN_DOMAIN ) .'" for="' . $this->get_field_id( 'link_author' ) . '">' . esc_html__( 'Link authors', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '</p>';

		// show_avatar
		$checked = ( ( ( !isset( $instance['show_avatar'] ) && Decent_Comments_Renderer::$defaults['show_avatar'] ) || ( isset( $instance['show_avatar'] ) && $instance['show_avatar'] === true ) ) ? 'checked="checked"' : '' );
		echo '<p>';
		echo '<input type="checkbox" ' . $checked . ' value="1" name="' . $this->get_field_name( 'show_avatar' ) . '" />';
		echo '<label class="title" title="' . esc_html__( "Show the avatar of the author.", DC_PLUGIN_DOMAIN ) .'" for="' . $this->get_field_id( 'show_avatar' ) . '">' . esc_html__( 'Show avatar', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '</p>';

		// avatar size
		$avatar_size = isset( $instance['avatar_size'] ) ? intval( $instance['avatar_size'] ) : '';
		echo "<p>";
		echo '<label class="title" title="' . esc_html__( "The size of the avatar in pixels.", DC_PLUGIN_DOMAIN ) .'" for="' .$this->get_field_id( 'avatar_size' ) . '">' . esc_html__( 'Avatar size', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '<input class="widefat" id="' . $this->get_field_id( 'avatar_size' ) . '" name="' . $this->get_field_name( 'avatar_size' ) . '" type="text" value="' . esc_attr( $avatar_size ) . '" />';
		echo '</p>';

		// show_link
		$checked = ( ( ( !isset( $instance['show_link'] ) && Decent_Comments_Renderer::$defaults['show_link'] ) || ( isset( $instance['show_link'] ) && $instance['show_link'] === true ) ) ? 'checked="checked"' : '' );
		echo '<p>';
		echo '<input type="checkbox" ' . $checked . ' value="1" name="' . $this->get_field_name( 'show_link' ) . '" />';
		echo '<label class="title" title="' . esc_html__( "Show a link to the post that the comment applies to.", DC_PLUGIN_DOMAIN ) .'" for="' . $this->get_field_id( 'show_link' ) . '">' . esc_html__( 'Show link to post', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '</p>';

		// show_comment
		$checked = ( ( ( !isset( $instance['show_comment'] ) && Decent_Comments_Renderer::$defaults['show_comment'] ) || ( isset( $instance['show_comment'] ) && $instance['show_comment'] === true ) ) ? 'checked="checked"' : '' );
		echo '<p>';
		echo '<input type="checkbox" ' . $checked . ' value="1" name="' . $this->get_field_name( 'show_comment' ) . '" />';
		echo '<label class="title" title="' . esc_html__( "Show an excerpt of the comment or the full comment.", DC_PLUGIN_DOMAIN ) .'" for="' . $this->get_field_id( 'show_comment' ) . '">' . esc_html__( 'Show the comment', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '</p>';

		// taxonomy & terms
		$taxonomy = isset( $instance['taxonomy'] ) ? $instance['taxonomy'] : '';
		echo "<p>";
		echo '<label class="title" title="' . esc_html__( "A taxonomy, e.g. category or post_tag", DC_PLUGIN_DOMAIN ) .'" for="' .$this->get_field_id( 'taxonomy' ) . '">' . esc_html__( 'Taxonomy', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '<input class="widefat" id="' . $this->get_field_id( 'taxonomy' ) . '" name="' . $this->get_field_name( 'taxonomy' ) . '" type="text" value="' . esc_attr( $taxonomy ) . '" />';
		echo '<br/>';
		echo '<span class="description">' . wp_kses_post( __( "Indicate <strong>category</strong> if you would like to show comments on posts in certain categories. Give the desired categories' slugs in <strong>Terms</strong>. For tags use <strong>post_tag</strong> and give the tags' slugs in <strong>Terms</strong>.", DC_PLUGIN_DOMAIN ) ) . '</span>';
		echo '</p>';

		$terms = '';
		if ( isset( $instance['terms'] ) ) {
			if ( ( '[current]' == strtolower( $instance['terms'] ) ) || ( '{current}' == strtolower( $instance['terms'] ) ) ) {
				$terms = '{current}';
			} else {
				$terms = $instance['terms'];
			}
		}
		echo "<p>";
		echo '<label class="title" title="' . esc_html__( "If a taxonomy is given , indicate terms in that taxonomy separated by comma to show comments for all posts related to these terms. To show comments on posts related to the same terms as the current post, indicate: {current}. If a taxonomy is given and terms is empty, no comments will be shown.", DC_PLUGIN_DOMAIN ) . '" for="' .$this->get_field_id( 'terms' ) . '">' . esc_html__( 'Terms', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '<input class="widefat" id="' . $this->get_field_id( 'terms' ) . '" name="' . $this->get_field_name( 'terms' ) . '" type="text" value="' . esc_attr( $terms ) . '" />';
		echo '<br/>';
		echo '<span class="description">' . wp_kses_post( __( "Terms or {current}. A <strong>Taxonomy</strong> must be given.", DC_PLUGIN_DOMAIN ) ) . '</span>';
		echo '</p>';

		// pingback
		$checked = ( ( ( !isset( $instance['pingback'] ) && Decent_Comments_Renderer::$defaults['pingback'] ) || ( isset( $instance['pingback'] ) && $instance['pingback'] === true ) ) ? 'checked="checked"' : '' );
		echo '<p>';
		echo '<input type="checkbox" ' . $checked . ' value="1" name="' . $this->get_field_name( 'pingback' ) . '" />';
		echo '<label class="title" title="' . esc_html__( "Include pingbacks.", DC_PLUGIN_DOMAIN ) .'" for="' . $this->get_field_id( 'pingback' ) . '">' . esc_html__( 'Pingbacks', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '</p>';

		// trackback
		$checked = ( ( ( !isset( $instance['trackback'] ) && Decent_Comments_Renderer::$defaults['trackback'] ) || ( isset( $instance['trackback'] ) && $instance['trackback'] === true ) ) ? 'checked="checked"' : '' );
		echo '<p>';
		echo '<input type="checkbox" ' . $checked . ' value="1" name="' . $this->get_field_name( 'trackback' ) . '" />';
		echo '<label class="title" title="' . esc_html__( "Include trackbacks.", DC_PLUGIN_DOMAIN ) .'" for="' . $this->get_field_id( 'trackback' ) . '">' . esc_html__( 'Trackbacks', DC_PLUGIN_DOMAIN ) . '</label>';
		echo '</p>';
	}
} // class Decent_Comments_Widget

Decent_Comments_Widget::init();
register_widget( 'Decent_Comments_Widget' );
