<?php
/**
 * class-decent-comments-helper.php
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
 * Provdes helper functions.
 */
class Decent_Comments_Helper {

	/**
	 * Retrieves the first post that contains $title.
	 * @param string $title what to search in titles for
	 * @param string $output Optional, default is Object. Either OBJECT, ARRAY_A, or ARRAY_N.
	 * @param string $post_type Optional, default is null meaning any post type.
	 */
	static function get_post_by_title( $title, $output = OBJECT, $post_type = null ) {
		global $wpdb;
		$post = null;
		if ( $post_type == null ) {
			$query = $wpdb->prepare(
				"SELECT ID FROM $wpdb->posts WHERE post_title LIKE '%%%s%%'",
				$title
			);
		} else {
			$query = $wpdb->prepare(
				"SELECT ID FROM $wpdb->posts WHERE post_title LIKE '%%%s%%' AND post_type= %s",
				$title,
				$post_type
			);
		}
		$result = $wpdb->get_row( $query );
		if ( !empty( $result ) ) {
			$post_id = $result->ID;
			$post = get_post( $post_id, $output );
		}
		return $post;
	}
}// class Decent_Comments_Helper
