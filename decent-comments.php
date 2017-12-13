<?php
/**
 * decent-comments.php
 * 
 * Copyright (c) 2011 - 2017 "kento" Karim Rahimpur www.itthinx.com
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
 *
 * Plugin Name: Decent Comments
 * Plugin URI: http://www.itthinx.com/plugins/decent-comments
 * Description: Provides configurable means to display comments that include author's avatars, author link, link to post and most importantly an excerpt of each comment. There are several options ... 
 * Version: 1.6.0
 * Author: itthinx
 * Author URI: http://www.itthinx.com
 * Donate-Link: http://www.itthinx.com/plugins/decent-comments
 * License: GPLv3
 */

if ( !defined( 'ABSPATH' ) ) {
	exit;
}

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
 * @return plugin settings
 */
function DC_get_settings() {
	global $DC_settings, $DC_version;
	if ( !isset( $DC_settings ) ) {
		$DC_settings = _DC_get_settings();
		$DC_version = "current";
		include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
		if ( function_exists( 'get_plugin_data' ) ) {
			$plugin_data = get_plugin_data( __FILE__ );
			if ( !empty( $plugin_data ) ) {
				$DC_version = $plugin_data['Version'];
			}
		}
	}
	return $DC_settings;
}

/**
 * Retrieves an option from settings or default value.
 * @param string $option desired option
 * @param mixed $default given default value or null if none given
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
 * @return plugin settings
 * @access private
 */
function _DC_get_settings() {
	return get_option( 'decent-comments-settings', array() );
}

/**
 * Updates plugin settings.
 * @param array $settings new plugin settings
 * @return bool true if successful, false otherwise
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

add_action( 'admin_menu', 'DC_admin_menu' );
/**
 * Add administration options.
 */
function DC_admin_menu() {
	if ( function_exists('add_submenu_page') ) {
		add_submenu_page( 'plugins.php', __( 'Decent Comments Options', DC_PLUGIN_DOMAIN ), __( 'Decent Comments', DC_PLUGIN_DOMAIN ), 'manage_options', 'decent-comments-options', 'DC_options');
	}
}

/**
 * Renders options screen and handles settings submission.
 */
function DC_options() {

	if ( !current_user_can( "manage_options" ) ) {
		wp_die( __( 'Access denied.', DC_PLUGIN_DOMAIN ) );
	}

	echo
		'<div>' .
			'<h2>' .
				__( 'Decent Comments Options', DC_PLUGIN_DOMAIN ) .
			'</h2>' .
		'</div>';

	// handle form submission
	if ( isset( $_POST['submit'] ) ) {
		if ( wp_verify_nonce( $_POST[DC_OPTIONS_NONCE], plugin_basename( __FILE__ ) ) ) {
			$settings = _DC_get_settings();
			if ( !empty( $_POST['delete-data'] ) ) {
				$settings['delete_data'] = true;
			} else {
				$settings['delete_data'] = false;
			}
			_DC_update_settings( $settings );
		}
	}

	$delete_data = DC_get_setting( 'delete_data', false );

	// render options form
	echo
		'<form action="" name="options" method="post">' .
			'<div>' .
				'<h3>' . __( 'Settings', DC_PLUGIN_DOMAIN ) . '</h3>' .
				'<p>' .
					'<input name="delete-data" type="checkbox" ' . ( $delete_data ? 'checked="checked"' : '' ) . '/>' .
					'<label for="delete-data">' . __( 'Delete settings when the plugin is deactivated', DC_PLUGIN_DOMAIN ) . '</label>' .
				'</p>' .
				'<p>' .
					wp_nonce_field( plugin_basename( __FILE__ ), DC_OPTIONS_NONCE, true, false ) .
					'<input type="submit" name="submit" class="button button-primary" value="' . __( 'Save', DC_PLUGIN_DOMAIN ) . '"/>' .
				'</p>' .
			'</div>' .
		'</form>';
}

add_filter( 'plugin_action_links', 'DC_plugin_action_links', 10, 2 );
/**
 * Adds an administrative link.
 * @param array $links
 * @param string $file
 */
function DC_plugin_action_links( $links, $file ) {
	if ( $file == plugin_basename( dirname(__FILE__) . '/decent-comments.php' ) ) {
		$links[] = '<a href="plugins.php?page=decent-comments-options">'.__( 'Options', DC_PLUGIN_DOMAIN ).'</a>';
	}
	return $links;
}

// @todo enable when needed
//add_action( 'wp_print_scripts', 'DC_print_scripts' );
/**
 * Enqueues scripts for non-admin pages.
 */
function DC_print_scripts() {
	global $DC_version;
	if ( !is_admin() ) {
		wp_enqueue_script( 'decent-comments', DC_PLUGIN_URL . 'js/decent-comments.js', array( 'jquery' ), $DC_version, true );
	}
}

// @todo enable when needed
//add_action( 'wp_print_styles', 'DC_wp_print_styles' );
/**
 * Enqueues styles for non-admin pages.
 */
function DC_wp_print_styles() {
	global $DC_version;
	if ( !is_admin() ) {
		wp_enqueue_style( 'decent-comments', DC_PLUGIN_URL . 'css/decent-comments.css', array(), $DC_version );
	}
}

// @todo enable when needed
//add_action( 'admin_print_styles', 'DC_admin_print_styles' );
/**
 * Enqueues scripts for admin pages.
 */
function DC_admin_print_styles() {
	global $DC_version;
	if ( is_admin() ) {
		wp_enqueue_style( 'decent-comments-admin', DC_PLUGIN_URL . 'css/decent-comments-admin.css', array(), $DC_version );
	}
}

// @todo enable when needed
//add_action( 'admin_print_scripts', 'DC_admin_print_scripts' );
function DC_admin_print_scripts() {
	global $DC_version;
	wp_enqueue_script( 'decent-comments-admin', DC_PLUGIN_URL . 'js/decent-comments-admin.js', array( 'jquery' ), $DC_version );
}

require_once( dirname( __FILE__ ) . '/class-decent-comments-helper.php' );
require_once( dirname( __FILE__ ) . '/class-decent-comments-renderer.php' );

add_action( 'widgets_init', 'DC_widgets_init' );
/**
 * Register widgets
 */
function DC_widgets_init() {
	require_once( dirname(__FILE__ ) . '/class-decent-comments-widget.php' );
}

add_action( 'init', 'DC_init' );

/**
 * Initialization.
 * - Loads the plugin's translations.
 */
function DC_init() {
	load_plugin_textdomain( DC_PLUGIN_DOMAIN, null, 'decent-comments/languages' );
}

require_once( dirname(__FILE__ ) . '/class-decent-comments-shortcode.php' );
