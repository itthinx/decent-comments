<?php
/**
 * class-decent-comment.php
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
 * @since decent-comments 1.1.0
 */

if ( !defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Based on WP_Comment_Query - the WordPress Comment Query class defined
 * in wp-includes/comment.php
 *
 * @see WP_Comment_Query
 * @since 1.1.0
 */
class Decent_Comment {

	/**
	 * Retrieve a list of comments.
	 *
	 * The comment list can be for the blog as a whole or for an individual post.
	 *
	 * The list of comment arguments are:
	 * - 'status'
	 * - 'orderby'
	 * - 'comment_date_gmt'
	 * - 'order'
	 * - 'number'
	 * - 'offset'
	 * - 'post_id'
	 *
	 * - 'taxonomy' : taxonomy name, defaults to 'category'
	 * - 'term_ids' : comma-separated list of term ids or array of term ids
	 * - 'terms' : comma-separated list of terms (e.g. category names) or array of category names
	 *
	 * @param mixed $args Optional. Array or string of options to override defaults.
	 * @return array List of comments.
	 */
	public static function get_comments( $args = '' ) {
		$query = new Decent_Comment();
		return $query->query( $args );
	}

	/**
	 * Execute the query
	 *
	 * @since 3.1.0
	 *
	 * @param string|array $query_vars
	 * @return int|array
	 */
	function query( $query_vars ) {

		global $wpdb;

		$defaults = array(
			'author_email' => '',
			'ID' => '',
			'karma' => '',
			'number' => '',
			'offset' => '',
			'orderby' => '',
			'order' => 'DESC',
			'parent' => '',
			'post_ID' => '',
			'post_id' => 0,
			'post_author' => '',
			'post_name' => '',
			'post_parent' => '',
			'post_status' => '',
			'post_type' => '',
			'status' => '',
			'type' => '',
			'user_id' => '',
			'search' => '',
			'count' => false,

			'taxonomy' => '',
			'terms' => '',
			'term_ids' => '',

			'pingback' => true,
			'trackback' => true,

			'exclude_post_author' => false

		);

		$this->query_vars = wp_parse_args( $query_vars, $defaults );
		do_action_ref_array( 'pre_get_comments', array( &$this ) );
		extract( $this->query_vars, EXTR_SKIP );

		// $args can be whatever, only use the args defined in defaults to compute the key
		$key = md5( serialize( compact( array_keys( $defaults ) ) )  );
		$last_changed = wp_cache_get( 'last_changed', 'comment' );
		if ( !$last_changed ) {
			$last_changed = time();
			wp_cache_set( 'last_changed', $last_changed, 'comment' );
		}
		$cache_key = "get_comments:$key:$last_changed";

		if ( $cache = wp_cache_get( $cache_key, 'comment' ) ) {
			return $cache;
		}

		$post_id = absint( $post_id );

		if ( 'hold' == $status ) {
			$approved = "comment_approved = '0'";
		} elseif ( 'approve' == $status ) {
			$approved = "comment_approved = '1'";
		} elseif ( 'spam' == $status ) {
			$approved = "comment_approved = 'spam'";
		} elseif ( 'trash' == $status ) {
			$approved = "comment_approved = 'trash'";
		} else {
			$approved = "( comment_approved = '0' OR comment_approved = '1' )";
		}

		$order = ( 'ASC' == strtoupper($order) ) ? 'ASC' : 'DESC';

		if ( ! empty( $orderby ) ) {
			$ordersby = is_array( $orderby ) ? $orderby : preg_split( '/[,\s]/', $orderby );
			$ordersby = array_intersect(
				$ordersby,
				array(
					'comment_agent',
					'comment_approved',
					'comment_author',
					'comment_author_email',
					'comment_author_IP',
					'comment_author_url',
					'comment_content',
					'comment_date',
					'comment_date_gmt',
					'comment_ID',
					'comment_karma',
					'comment_parent',
					'comment_post_ID',
					'comment_type',
					'user_id',
				)
			);
			$orderby = empty( $ordersby ) ? 'comment_date_gmt' : implode( ', ', $ordersby );
		} else {
			$orderby = 'comment_date_gmt';
		}

		$number = absint( $number );
		$offset = absint( $offset );

		if ( !empty($number) ) {
			if ( $offset ) {
				$limits = 'LIMIT ' . $offset . ',' . $number;
			} else {
				$limits = 'LIMIT ' . $number;
			}
		} else {
			$limits = '';
		}

		if ( $count ) {
			$fields = 'COUNT(*)';
		} else {
			$fields = '*';
		}
		$join = '';
		$where = $approved;

		if ( ! empty( $post_id ) ) {
			$where .= $wpdb->prepare( ' AND comment_post_ID = %d', $post_id );
		}
		if ( '' !== $author_email ) {
			$where .= $wpdb->prepare( ' AND comment_author_email = %s', $author_email );
		}
		if ( '' !== $karma ) {
			$where .= $wpdb->prepare( ' AND comment_karma = %d', $karma );
		}
		if ( 'comment' == $type ) {
			$where .= " AND comment_type = ''";
		} elseif ( 'pings' == $type ) {
			$where .= ' AND comment_type IN ("pingback", "trackback")';
		} elseif ( ! empty( $type ) ) {
			$where .= $wpdb->prepare( ' AND comment_type = %s', $type );
		}
		if ( !$pingback ) {
			$where .= " AND comment_type != 'pingback' ";
		}
		if ( !$trackback ) {
			$where .= " AND comment_type != 'trackback' ";
		}
		if ( '' !== $parent ) {
			$where .= $wpdb->prepare( ' AND comment_parent = %d', $parent );
		}
		if ( '' !== $user_id ) {
			$where .= $wpdb->prepare( ' AND user_id = %d', $user_id );
		}
		if ( '' !== $search ) {
			$where .= $this->get_search_sql( $search, array( 'comment_author', 'comment_author_email', 'comment_author_url', 'comment_author_IP', 'comment_content' ) );
		}

		$post_fields = array_filter( compact( array( 'post_author', 'post_name', 'post_parent', 'post_status', 'post_type', ) ) );
		if ( ! empty( $post_fields ) || $exclude_post_author ) {
			$join = "JOIN $wpdb->posts ON $wpdb->posts.ID = $wpdb->comments.comment_post_ID";
			if ( ! empty( $post_fields ) ) {
				foreach( $post_fields as $field_name => $field_value ) {
					if ( is_array( $field_value ) ) {
						$where .= sprintf(
							" AND {$wpdb->posts}.{$field_name} IN (%s)",
							'\'' . implode( '\',\'', array_map( 'esc_sql', $field_value ) ) . '\''
						);
					} else {
						$where .= $wpdb->prepare( " AND {$wpdb->posts}.{$field_name} = %s", $field_value );
					}
				}
			}
			if ( $exclude_post_author ) {
				$where .= " AND $wpdb->comments.user_id != $wpdb->posts.post_author ";
			}
		}

		$pieces = array( 'fields', 'join', 'where', 'orderby', 'order', 'limits' );
		$clauses = apply_filters_ref_array( 'comments_clauses', array( compact( $pieces ), &$this ) );
		foreach ( $pieces as $piece ) {
			$$piece = isset( $clauses[ $piece ] ) ? $clauses[ $piece ] : '';
		}

		// terms - check the term_ids and limit comments to those on posts related to these terms
		// If the list of term_ids is empty, there won't be any comments displayed.
		if ( !empty( $taxonomy ) ) {
			if ( is_string( $term_ids ) ) {
				$term_ids = explode( ",", $term_ids );
			}
			if ( !empty( $terms ) ) {
				if ( is_string( $terms ) ) {
					$terms = explode( ",", $terms );
				}
				foreach ( $terms as $term ) {
					$term_names[] = "%s";
				}
				$term_names = implode( ",", $term_names );
				$terms = $wpdb->get_results( $wpdb->prepare( "SELECT DISTINCT term_id FROM $wpdb->terms WHERE slug IN ( $term_names )", $terms ) );
				foreach ( $terms as $term ) {
					if ( !in_array( $term->term_id, $term_ids ) ) {
						$term_ids[] = $term->term_id;
					}
				}
			}
			global $wp_version;
			if ( isset( $wp_version ) && ( version_compare( $wp_version, '4.5' ) >= 0 ) ) {
				$terms = get_terms( array( 'taxonomy' => $taxonomy, 'include' => $term_ids ) );
			} else {
				$terms = get_terms( $taxonomy, array( 'include' => $term_ids ) );
			}
			if ( is_array( $terms ) ) {
				$term_ids = array();
				foreach ( $terms as $term ) {
					$term_ids[] = $term->term_id;
				}
				$term_ids = implode( ",", $term_ids );
				if ( strlen($term_ids) == 0 ) {
					$term_ids = "NULL";
				}
				$where .=
					" AND comment_post_ID IN (
						SELECT DISTINCT ID FROM $wpdb->posts
						LEFT JOIN $wpdb->term_relationships ON $wpdb->posts.ID = $wpdb->term_relationships.object_id
						LEFT JOIN $wpdb->term_taxonomy ON $wpdb->term_relationships.term_taxonomy_id = $wpdb->term_taxonomy.term_taxonomy_id
						WHERE $wpdb->term_taxonomy.term_id IN ( $term_ids )
						) ";
			}
		}

		$query = "SELECT $fields FROM $wpdb->comments $join WHERE $where ORDER BY $orderby $order $limits";

		if ( $count ) {
			return $wpdb->get_var( $query );
		}

		$comments = $wpdb->get_results( $query );
		$comments = apply_filters_ref_array( 'the_comments', array( $comments, &$this ) );

		wp_cache_add( $cache_key, $comments, 'comment' );

		return $comments;
	}

	/*
	 * Used internally to generate an SQL string for searching across multiple columns
	 *
	 * @access protected
	 *
	 * @param string $string
	 * @param array $cols
	 * @return string
	 */
	function get_search_sql( $string, $cols ) {

		global $wpdb;

		if ( method_exists( $wpdb, 'esc_like' ) ) {
			$string = esc_sql( $wpdb->esc_like( $string ) );
		} else {
			$string = esc_sql( like_escape( $string ) );
		}

		$searches = array();
		foreach ( $cols as $col ) {
			$searches[] = "$col LIKE '%$string%'";
		}

		return ' AND (' . implode(' OR ', $searches) . ')';
	}
}
