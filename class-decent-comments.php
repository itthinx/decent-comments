<?php
/**
 * class-decent-comments.php
 *
 * Copyright (c) "kento" Karim Rahimpur www.itthinx.com
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
 * Main plugin class. Gets things started.
 *
 * @since 3.0.0
 */
class Decent_Comments {

	public static function boot() {
		add_filter( 'plugin_action_links', array( __CLASS__, 'plugin_action_links' ), 10, 2 );
		// add_action( 'wp_print_scripts', array( __CLASS__, 'print_scripts' ) );
		// add_action( 'wp_print_styles', array( __CLASS__, 'wp_print_styles' ) );
		// add_action( 'admin_print_styles', array( __CLASS__, 'admin_print_styles' ) );
		// add_action( 'admin_print_scripts', array( __CLASS__, 'DC_admin_print_scripts' ) );
		add_action( 'widgets_init', array( __CLASS__, 'widgets_init' ) );
		add_action( 'init', array( __CLASS__, 'init' ) );
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ) );

		require_once( dirname( __FILE__ ) . '/class-decent-comments-helper.php' );
		require_once( dirname( __FILE__ ) . '/class-decent-comments-rest.php' );
		require_once( dirname( __FILE__ ) . '/blocks/class-decent-comments-blocks.php' );
	}

	/**
	 * Adds an administrative link.
	 *
	 * @param array $links
	 * @param string $file
	 *
	 * @return array
	 */
	public static function plugin_action_links( $links, $file ) {
		if ( $file == plugin_basename( dirname( __FILE__ ) . '/decent-comments.php' ) ) {
			$links[] = '<a href="plugins.php?page=decent-comments-options">' . esc_html__( 'Options', 'decent-comments' ) . '</a>';
		}
		return $links;
	}

	/**
	 * Enqueues scripts for non-admin pages.
	 */
	public static function print_scripts() {
		if ( !is_admin() ) {
			wp_enqueue_script( 'decent-comments', DC_PLUGIN_URL . 'js/decent-comments.js', array( 'jquery' ), DECENT_COMMENTS_PLUGIN_VERSION, true );
		}
	}

	/**
	 * Enqueues styles for non-admin pages.
	 */
	public static function wp_print_styles() {
		if ( !is_admin() ) {
			wp_enqueue_style( 'decent-comments', DC_PLUGIN_URL . 'css/decent-comments.css', array(), DECENT_COMMENTS_PLUGIN_VERSION );
		}
	}

	/**
	 * Enqueues scripts for admin pages.
	 */
	public static function admin_print_styles() {
		if ( is_admin() ) {
			wp_enqueue_style( 'decent-comments-admin', DC_PLUGIN_URL . 'css/decent-comments-admin.css', array(), DECENT_COMMENTS_PLUGIN_VERSION );
		}
	}

	public static function admin_print_scripts() {
		wp_enqueue_script( 'decent-comments-admin', DC_PLUGIN_URL . 'js/decent-comments-admin.js', array( 'jquery' ), DECENT_COMMENTS_PLUGIN_VERSION );
	}

	/**
	 * Register widgets
	 */
	public static function widgets_init() {
		require_once( dirname( __FILE__ ) . '/class-decent-comments-widget.php' );
	}

	/**
	 * Initialization.
	 *
	 * Loads the plugin's translations.
	 * Loads the renderer class.
	 * Loads the shortcode handler class.
	 */
	public static function init() {
		load_plugin_textdomain( 'decent-comments', null, 'decent-comments/languages' );
		require_once( dirname( __FILE__ ) . '/class-decent-comments-renderer.php' );
		require_once( dirname( __FILE__ ) . '/class-decent-comments-shortcode.php' );
	}

	/**
	 * Add administration options.
	 */
	public static function admin_menu() {
		if ( function_exists( 'add_submenu_page' ) ) {
			add_submenu_page(
				'plugins.php',
				esc_html__( 'Decent Comments Options', 'decent-comments' ),
				esc_html__( 'Decent Comments', 'decent-comments' ),
				'manage_options',
				'decent-comments-options',
				array( __CLASS__, 'options' )
			);
		}
	}

	/**
	 * Renders options screen and handles settings submission.
	 */
	public static function options() {

		if ( !current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Access denied.', 'decent-comments' ) );
		}

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

		echo
			'<div>' .
			'<h2>' .
			esc_html__( 'Decent Comments Options', 'decent-comments' ) .
			'</h2>' .
			'</div>';

		// render options form
		echo
			'<form action="" name="options" method="post">' .
			'<div>' .
			'<h3>' . esc_html__( 'Settings', 'decent-comments' ) . '</h3>' .
			'<p>' .
			'<input name="delete-data" type="checkbox" ' . ( $delete_data ? 'checked="checked"' : '' ) . '/>' .
			'<label for="delete-data">' . esc_html__( 'Delete settings when the plugin is deactivated', 'decent-comments' ) . '</label>' .
			'</p>' .
			'<p>' .
			wp_nonce_field( plugin_basename( __FILE__ ), DC_OPTIONS_NONCE, true, false ) .
			'<input type="submit" name="submit" class="button button-primary" value="' . esc_html__( 'Save', 'decent-comments' ) . '"/>' .
			'</p>' .
			'</div>' .
			'</form>';
	}
}

Decent_Comments::boot();
