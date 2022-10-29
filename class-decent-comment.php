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
	 * @since 1.11.0
	 *
	 * @var array
	 */
	private $query_vars = null;

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
	 *
	 * @return array List of comments.
	 */
	public static function get_comments( $args = '' ) {
		$query = new Decent_Comment();
		return $query->query( $args );
	}

	/**
	 * Query extended.
	 *
	 * @param array $query_vars
	 *
	 * @return array|number
	 */
	public function query( $query_vars ) {
		$this->query_vars = $query_vars;
		$query = new WP_Comment_Query();
		add_filter( 'comments_clauses', array( $this, 'comments_clauses' ), 10, 2 );
		$comments = $query->query( $query_vars );
		remove_filter( 'comments_clauses', array( $this, 'comments_clauses' ), 10 );
		return $comments;
	}

	/**
	 * Filters the where clause with added support for extended parameters.
	 *
	 * @since 1.11.0
	 *
	 * @param string[] $clauses
	 * @param WP_Comment_Query $wp_comment_query
	 *
	 * @return string[]
	 */
	public function comments_clauses( $clauses, $wp_comment_query ) {

		global $wpdb;

		if ( $this->query_vars !== null ) {

			$taxonomy = '';
			$terms = '';
			$term_ids = '';

			$pingback = true;
			$trackback = true;

			$exclude_post_author = false;

			if ( isset( $this->query_vars['taxonomy'] ) ) {
				$taxonomy = $this->query_vars['taxonomy'];
			}
			if ( isset( $this->query_vars['terms'] ) ) {
				$terms = $this->query_vars['terms'];
			}
			if ( isset( $this->query_vars['term_ids'] ) ) {
				$term_ids = $this->query_vars['term_ids'];
			}
			if ( isset( $this->query_vars['pingback'] ) ) {
				$pingback = $this->query_vars['pingback'];
			}
			if ( isset( $this->query_vars['trackback'] ) ) {
				$trackback = $this->query_vars['trackback'];
			}
			if ( isset( $this->query_vars['exclude_post_author'] ) ) {
				$exclude_post_author = $this->query_vars['exclude_post_author'];
			}

			$where = '';

			if ( !$pingback ) {
				$where .= " AND comment_type != 'pingback' ";
			}
			if ( !$trackback ) {
				$where .= " AND comment_type != 'trackback' ";
			}

			if ( $exclude_post_author ) {
				$where .= " AND $wpdb->comments.user_id != $wpdb->posts.post_author ";
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
					$term_ids = array_unique( array_map( 'intval', $term_ids ) );
					$term_ids = implode( ',', $term_ids );
					if ( strlen( $term_ids ) == 0 ) {
						$term_ids = 'NULL';
					}
					$where .=
						" AND comment_post_ID IN ( " .
						"SELECT DISTINCT ID FROM $wpdb->posts " .
						"LEFT JOIN $wpdb->term_relationships ON $wpdb->posts.ID = $wpdb->term_relationships.object_id " .
						"LEFT JOIN $wpdb->term_taxonomy ON $wpdb->term_relationships.term_taxonomy_id = $wpdb->term_taxonomy.term_taxonomy_id " .
						"WHERE $wpdb->term_taxonomy.term_id IN ( $term_ids ) " .
						") ";
				}
			}

			if ( strlen( $where ) > 0 ) {
				$clauses['where'] .= ' ' . $where;
			}

		}
		return $clauses;
	}
}
