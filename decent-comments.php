<?php
/**
 * Plugin Name: Decent Comments
 * Plugin URI: https://www.itthinx.com/plugins/decent-comments
 * Description: Provides configurable means to display comments that include author's avatars, author link, link to post and most importantly an excerpt of each comment. Thanks for supporting our work with a purchase in our <a href="https://www.itthinx.com/shop/">Shop</a>!
 * Version: 3.0.2
 * Requires at least: 6.5
 * Requires PHP: 7.4
 * Author: itthinx
 * Author URI: https://www.itthinx.com
 * Donate-Link: https://www.itthinx.com/shop/
 * Text Domain: decent-comments
 * Domain Path: /languages
 * License: GPLv3
 *
 * Copyright (c) 2015 - 2025 "kento" Karim Rahimpur www.itthinx.com
 *
 * This code is released under the GNU General Public License Version 3.
 * The following additional terms apply to all files as per section
 * "7. Additional Terms." See COPYRIGHT.txt and LICENSE.txt.
 *
 * This code is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * All legal, copyright and license notices and all author attributions
 * must be preserved in all files and user interfaces.
 *
 * Where modified versions of this material are allowed under the applicable
 * license, modified version must be marked as such and the origin of the
 * modified material must be clearly indicated, including the copyright
 * holder, the author and the date of modification and the origin of the
 * modified material.
 *
 * This material may not be used for publicity purposes and the use of
 * names of licensors and authors of this material for publicity purposes
 * is prohibited.
 *
 * The use of trade names, trademarks or service marks, licensor or author
 * names is prohibited unless granted in writing by their respective owners.
 *
 * Where modified versions of this material are allowed under the applicable
 * license, anyone who conveys this material (or modified versions of it) with
 * contractual assumptions of liability to the recipient, for any liability
 * that these contractual assumptions directly impose on those licensors and
 * authors, is required to fully indemnify the licensors and authors of this
 * material.
 *
 * This header and all notices must be kept intact.
 *
 * @author itthinx
 * @package decent-comments
 * @since 1.0.0
 */

if ( !defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin version.
 *
 * @since 3.0.0
 *
 * @var string
 */
define( 'DECENT_COMMENTS_PLUGIN_VERSION', '3.0.2' );

/**
 * @var string plugin url
 */
define( 'DC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * @var string plugin domain
 */
define( 'DC_PLUGIN_DOMAIN', 'decent-comments' );

/**
 * @var int throbber height
 */
define( 'DC_THROBBER_HEIGHT', 16 );

/**
 * @var string options nonce
 */
define( 'DC_OPTIONS_NONCE', "dc-options-nonce" );

/**
 * Returns settings.
 *
 * @return array plugin settings
 */
function DC_get_settings() {
	global $DC_settings;
	if ( !isset( $DC_settings ) ) {
		$DC_settings = _DC_get_settings();
	}
	return $DC_settings;
}

/**
 * Retrieves an option from settings or default value.
 *
 * @param string $option desired option
 * @param mixed $default given default value or null if none given
 *
 * @return array
 */
function DC_get_setting( $option, $default = null ) {
	$settings = DC_get_settings();
	if ( isset( $settings[$option] ) ) {
		return $settings[$option];
	} else {
		return $default;
	}
}

/**
 * Retrieves plugin settings.
 *
 * @return array plugin settings
 *
 * @access private
 */
function _DC_get_settings() {
	return get_option( 'decent-comments-settings', array() );
}

/**
 * Updates plugin settings.
 *
 * @param array $settings new plugin settings
 *
 * @return bool true if successful, false otherwise
 *
 * @access private
 */
function _DC_update_settings( $settings ) {
	global $DC_settings;
	$result = false;
	if ( update_option( 'decent-comments-settings', $settings ) ) {
		$result = true;
		$DC_settings = get_option( 'decent-comments-settings', array() );
	}
	return $result;
}

register_deactivation_hook( __FILE__, 'DC_deactivate' );
/**
 * Removes plugin data if required.
 */
function DC_deactivate() {
	if ( DC_get_setting( "delete_data", false ) ) {
		delete_option( 'decent-comments-settings' );
	}
}

require_once dirname( __FILE__ ) . '/class-decent-comments.php';
