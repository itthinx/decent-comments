<?php
/**
 * class-decent-comments-shortcode.php
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
 * Decent Comments shortcode handler.
 */
class Decent_Comments_Shortcode {

	/**
	 * Renders comments based on shortcode attributes.
	 * @param array $atts settings
	 * @param string $content unused
	 * @return rendered comments
	 */
	static function decent_comments( $atts, $content = null ) {
		$options = shortcode_atts( Decent_Comments_Renderer::$defaults, $atts );
		return Decent_Comments_Renderer::get_comments( $options );
	}

} // class Decent_Comments_Shortcode

add_shortcode( 'decent-comments', array( 'Decent_Comments_Shortcode', 'decent_comments' ) );
add_shortcode( 'decent_comments', array( 'Decent_Comments_Shortcode', 'decent_comments' ) );
