<?php
/**
 * Plugin Name: Landing Page Abilities
 * Description: Registrerer WordPress Abilities til at oprette og redigere landingssider via MCP.
 * Version: 1.4.0
 * Requires at least: 6.8
 * Requires PHP: 7.4
 */

declare( strict_types=1 );

// REST API endpoint til at skrive stor Elementor JSON direkte
add_action( 'rest_api_init', function () {
	register_rest_route( 'lpa/v1', '/set-elementor-data', [
		'methods'             => 'POST',
		'callback'            => function ( WP_REST_Request $request ) {
			$page_id       = (int) $request->get_param( 'id' );
			$elementor_data = $request->get_param( 'elementor_data' );
			$page_settings  = $request->get_param( 'elementor_page_settings' );
			$template       = $request->get_param( 'template' );

			$page = get_post( $page_id );
			if ( ! $page || $page->post_type !== 'page' ) {
				return new WP_Error( 'not_found', 'Side ikke fundet', [ 'status' => 404 ] );
			}

			$decoded = json_decode( $elementor_data );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				return new WP_Error( 'invalid_json', 'Ugyldig JSON: ' . json_last_error_msg(), [ 'status' => 400 ] );
			}

			update_post_meta( $page_id, '_elementor_data', wp_slash( $elementor_data ) );
			update_post_meta( $page_id, '_elementor_edit_mode', 'builder' );
			update_post_meta( $page_id, '_elementor_version', '3.32.3' );
			delete_post_meta( $page_id, '_elementor_css' );

			// _elementor_page_settings skal altid eksistere som et array for at undgå PHP-fejl i Elementor
			if ( ! empty( $page_settings ) ) {
				$settings_decoded = json_decode( $page_settings, true );
				if ( is_array( $settings_decoded ) ) {
					update_post_meta( $page_id, '_elementor_page_settings', $settings_decoded );
				} else {
					update_post_meta( $page_id, '_elementor_page_settings', [] );
				}
			} else {
				// Sæt altid et tomt array så Elementor ikke crasher
				update_post_meta( $page_id, '_elementor_page_settings', [] );
			}

			if ( ! empty( $template ) ) {
				update_post_meta( $page_id, '_wp_page_template', sanitize_text_field( $template ) );
			}

			wp_update_post( [ 'ID' => $page_id, 'post_content' => '' ] );

			return [ 'success' => true, 'id' => $page_id ];
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
		'args' => [
			'id'                      => [ 'required' => true, 'type' => 'integer' ],
			'elementor_data'          => [ 'required' => true, 'type' => 'string' ],
			'elementor_page_settings' => [ 'required' => false, 'type' => 'string' ],
			'template'                => [ 'required' => false, 'type' => 'string' ],
		],
	] );
} );

// REST API endpoint til at uploade mediefiler (base64)
add_action( 'rest_api_init', function () {
	register_rest_route( 'lpa/v1', '/upload-media', [
		'methods'             => 'POST',
		'callback'            => function ( WP_REST_Request $request ) {
			$filename = sanitize_file_name( $request->get_param( 'filename' ) );
			$base64   = $request->get_param( 'data' );
			$alt      = sanitize_text_field( $request->get_param( 'alt' ) ?? '' );
			$title    = sanitize_text_field( $request->get_param( 'title' ) ?? '' );

			if ( empty( $filename ) || empty( $base64 ) ) {
				return new WP_Error( 'missing_params', 'filename og data (base64) er påkrævet', [ 'status' => 400 ] );
			}

			// Decode base64
			$file_data = base64_decode( $base64, true );
			if ( $file_data === false ) {
				return new WP_Error( 'invalid_base64', 'Ugyldig base64-data', [ 'status' => 400 ] );
			}

			// Skriv til midlertidig fil
			require_once ABSPATH . 'wp-admin/includes/file.php';
			$tmp_file = wp_tempnam( $filename );
			file_put_contents( $tmp_file, $file_data );

			// Brug wp_handle_sideload til at flytte filen til uploads
			$file_array = [
				'name'     => $filename,
				'tmp_name' => $tmp_file,
			];

			// Tillad SVG mime type
			$overrides = [
				'test_form' => false,
				'mimes'     => array_merge( get_allowed_mime_types(), [
					'svg' => 'image/svg+xml',
				] ),
			];

			$uploaded = wp_handle_sideload( $file_array, $overrides );

			if ( isset( $uploaded['error'] ) ) {
				return new WP_Error( 'upload_failed', $uploaded['error'], [ 'status' => 500 ] );
			}

			// Opret attachment post
			$attachment = [
				'post_title'     => $title ?: pathinfo( $filename, PATHINFO_FILENAME ),
				'post_content'   => '',
				'post_status'    => 'inherit',
				'post_mime_type' => $uploaded['type'],
			];

			$attach_id = wp_insert_attachment( $attachment, $uploaded['file'] );

			if ( is_wp_error( $attach_id ) ) {
				return new WP_Error( 'attachment_failed', 'Kunne ikke oprette attachment', [ 'status' => 500 ] );
			}

			// Generer metadata (thumbnails osv.)
			require_once ABSPATH . 'wp-admin/includes/image.php';
			$metadata = wp_generate_attachment_metadata( $attach_id, $uploaded['file'] );
			wp_update_attachment_metadata( $attach_id, $metadata );

			// Sæt alt-tekst
			if ( ! empty( $alt ) ) {
				update_post_meta( $attach_id, '_wp_attachment_image_alt', $alt );
			}

			return [
				'success' => true,
				'id'      => $attach_id,
				'url'     => wp_get_attachment_url( $attach_id ),
				'filename' => $filename,
			];
		},
		'permission_callback' => function () {
			return current_user_can( 'upload_files' );
		},
		'args' => [
			'filename' => [ 'required' => true, 'type' => 'string' ],
			'data'     => [ 'required' => true, 'type' => 'string' ],
			'alt'      => [ 'required' => false, 'type' => 'string' ],
			'title'    => [ 'required' => false, 'type' => 'string' ],
		],
	] );
} );

// Registrer kategorier
add_action( 'wp_abilities_api_categories_init', function () {
	wp_register_ability_category( 'content', [
		'label'       => __( 'Indhold', 'landing-page-abilities' ),
		'description' => __( 'Abilities til at læse og skrive sideindhold', 'landing-page-abilities' ),
	] );
	wp_register_ability_category( 'media', [
		'label'       => __( 'Medier', 'landing-page-abilities' ),
		'description' => __( 'Abilities til at håndtere billeder og filer', 'landing-page-abilities' ),
	] );
	wp_register_ability_category( 'seo', [
		'label'       => __( 'SEO', 'landing-page-abilities' ),
		'description' => __( 'Abilities til at styre SEO-metadata', 'landing-page-abilities' ),
	] );
	wp_register_ability_category( 'site-info', [
		'label'       => __( 'Site-information', 'landing-page-abilities' ),
		'description' => __( 'Generel information om sitet', 'landing-page-abilities' ),
	] );
} );

// Registrer abilities
add_action( 'wp_abilities_api_init', function () {

	// -------------------------------------------------------------------------
	// SITE INFO
	// -------------------------------------------------------------------------

	wp_register_ability( 'landing-pages/get-site-info', [
		'label'       => __( 'Hent site-information', 'landing-page-abilities' ),
		'description' => __( 'Returnerer sitets navn, tagline, URL og sprog.', 'landing-page-abilities' ),
		'category'    => 'site-info',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'name'        => [ 'type' => 'string', 'description' => 'Sitets navn' ],
				'tagline'     => [ 'type' => 'string', 'description' => 'Sitets tagline' ],
				'url'         => [ 'type' => 'string', 'description' => 'Sitets URL' ],
				'language'    => [ 'type' => 'string', 'description' => 'Sitets sprog' ],
				'admin_email' => [ 'type' => 'string', 'description' => 'Admin e-mail' ],
			],
		],
		'execute_callback'    => function () {
			return [
				'name'        => get_bloginfo( 'name' ),
				'tagline'     => get_bloginfo( 'description' ),
				'url'         => home_url(),
				'language'    => get_bloginfo( 'language' ),
				'admin_email' => get_bloginfo( 'admin_email' ),
			];
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
	] );

	// -------------------------------------------------------------------------
	// SIDER - LÆS
	// -------------------------------------------------------------------------

	wp_register_ability( 'landing-pages/list-pages', [
		'label'       => __( 'List sider', 'landing-page-abilities' ),
		'description' => __( 'Returnerer en liste af alle sider med ID, titel, status, slug og URL.', 'landing-page-abilities' ),
		'category'    => 'content',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'status'   => [
					'type'        => 'string',
					'description' => 'Filtrer på status: publish, draft, private, any',
					'default'     => 'any',
				],
				'per_page' => [
					'type'        => 'integer',
					'description' => 'Antal sider pr. side (maks 100)',
					'default'     => 50,
				],
			],
		],
		'output_schema' => [
			'type'  => 'array',
			'items' => [
				'type'       => 'object',
				'properties' => [
					'id'       => [ 'type' => 'integer' ],
					'title'    => [ 'type' => 'string' ],
					'slug'     => [ 'type' => 'string' ],
					'status'   => [ 'type' => 'string' ],
					'url'      => [ 'type' => 'string' ],
					'template' => [ 'type' => 'string' ],
					'modified' => [ 'type' => 'string' ],
				],
			],
		],
		'execute_callback'    => function ( $input ) {
			$status   = $input['status'] ?? 'any';
			$per_page = min( (int) ( $input['per_page'] ?? 50 ), 100 );

			$pages = get_posts( [
				'post_type'      => 'page',
				'post_status'    => $status,
				'posts_per_page' => $per_page,
				'orderby'        => 'title',
				'order'          => 'ASC',
			] );

			return array_map( function ( $page ) {
				return [
					'id'       => $page->ID,
					'title'    => $page->post_title,
					'slug'     => $page->post_name,
					'status'   => $page->post_status,
					'url'      => get_permalink( $page->ID ),
					'template' => get_page_template_slug( $page->ID ) ?: 'default',
					'modified' => $page->post_modified,
				];
			}, $pages );
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
	] );

	wp_register_ability( 'landing-pages/get-page', [
		'label'       => __( 'Hent side', 'landing-page-abilities' ),
		'description' => __( 'Returnerer fuld information om en enkelt side inkl. indhold, meta og SEO.', 'landing-page-abilities' ),
		'category'    => 'content',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'id' => [
					'type'        => 'integer',
					'description' => 'Side-ID',
				],
			],
			'required' => [ 'id' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'id'             => [ 'type' => 'integer' ],
				'title'          => [ 'type' => 'string' ],
				'slug'           => [ 'type' => 'string' ],
				'status'         => [ 'type' => 'string' ],
				'content'        => [ 'type' => 'string' ],
				'excerpt'        => [ 'type' => 'string' ],
				'url'            => [ 'type' => 'string' ],
				'template'       => [ 'type' => 'string' ],
				'featured_image' => [ 'type' => [ 'string', 'null' ] ],
				'meta'           => [ 'type' => 'object' ],
				'seo'            => [ 'type' => 'object' ],
				'modified'       => [ 'type' => 'string' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			$page = get_post( (int) $input['id'] );
			if ( ! $page || $page->post_type !== 'page' ) {
				return new WP_Error( 'not_found', 'Side ikke fundet' );
			}

			$featured_image = null;
			if ( has_post_thumbnail( $page->ID ) ) {
				$featured_image = get_the_post_thumbnail_url( $page->ID, 'full' );
			}

			// Byg SEO-data (understøtter Yoast og RankMath)
			$seo = lpa_get_seo_data( $page->ID );

			return [
				'id'             => $page->ID,
				'title'          => $page->post_title,
				'slug'           => $page->post_name,
				'status'         => $page->post_status,
				'content'        => $page->post_content,
				'excerpt'        => $page->post_excerpt,
				'url'            => get_permalink( $page->ID ),
				'template'       => get_page_template_slug( $page->ID ) ?: 'default',
				'featured_image' => $featured_image,
				'meta'           => (object) get_post_meta( $page->ID ),
				'seo'            => $seo,
				'modified'       => $page->post_modified,
			];
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
	] );

	// -------------------------------------------------------------------------
	// SIDER - SKRIV
	// -------------------------------------------------------------------------

	wp_register_ability( 'landing-pages/create-page', [
		'label'       => __( 'Opret side', 'landing-page-abilities' ),
		'description' => __( 'Opretter en ny WordPress-side med titel, indhold, slug og valgfri SEO-metadata.', 'landing-page-abilities' ),
		'category'    => 'content',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'title'          => [ 'type' => 'string', 'description' => 'Side-titel' ],
				'content'        => [ 'type' => 'string', 'description' => 'Sideindhold (HTML eller blokke)' ],
				'slug'           => [ 'type' => 'string', 'description' => 'URL-slug (valgfri)' ],
				'status'         => [
					'type'        => 'string',
					'description' => 'publish, draft eller private',
					'default'     => 'draft',
				],
				'excerpt'        => [ 'type' => 'string', 'description' => 'Kort beskrivelse' ],
				'template'       => [ 'type' => 'string', 'description' => 'Sidetemplates filnavn (valgfri)' ],
				'parent_id'      => [ 'type' => 'integer', 'description' => 'Overordnet side-ID (valgfri)' ],
				'seo_title'      => [ 'type' => 'string', 'description' => 'SEO meta-titel' ],
				'seo_description'=> [ 'type' => 'string', 'description' => 'SEO meta-beskrivelse' ],
			],
			'required' => [ 'title', 'content' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'id'  => [ 'type' => 'integer' ],
				'url' => [ 'type' => 'string' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			$args = [
				'post_title'   => sanitize_text_field( $input['title'] ),
				'post_content' => wp_kses_post( $input['content'] ),
				'post_status'  => in_array( $input['status'] ?? 'draft', [ 'publish', 'draft', 'private' ], true )
					? $input['status']
					: 'draft',
				'post_type'    => 'page',
			];

			if ( ! empty( $input['slug'] ) ) {
				$args['post_name'] = sanitize_title( $input['slug'] );
			}
			if ( ! empty( $input['excerpt'] ) ) {
				$args['post_excerpt'] = sanitize_text_field( $input['excerpt'] );
			}
			if ( ! empty( $input['parent_id'] ) ) {
				$args['post_parent'] = (int) $input['parent_id'];
			}

			$page_id = wp_insert_post( $args, true );
			if ( is_wp_error( $page_id ) ) {
				return $page_id;
			}

			if ( ! empty( $input['template'] ) ) {
				update_post_meta( $page_id, '_wp_page_template', sanitize_text_field( $input['template'] ) );
			}

			lpa_save_seo_data( $page_id, $input );

			return [
				'id'  => $page_id,
				'url' => get_permalink( $page_id ),
			];
		},
		'permission_callback' => function () {
			return current_user_can( 'publish_pages' );
		},
	] );

	wp_register_ability( 'landing-pages/update-page', [
		'label'       => __( 'Opdater side', 'landing-page-abilities' ),
		'description' => __( 'Opdaterer en eksisterende side. Kun de felter der sendes vil blive ændret.', 'landing-page-abilities' ),
		'category'    => 'content',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'id'             => [ 'type' => 'integer', 'description' => 'Side-ID' ],
				'title'          => [ 'type' => 'string' ],
				'content'        => [ 'type' => 'string' ],
				'slug'           => [ 'type' => 'string' ],
				'status'         => [ 'type' => 'string' ],
				'excerpt'        => [ 'type' => 'string' ],
				'template'       => [ 'type' => 'string' ],
				'seo_title'      => [ 'type' => 'string' ],
				'seo_description'=> [ 'type' => 'string' ],
			],
			'required' => [ 'id' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'id'  => [ 'type' => 'integer' ],
				'url' => [ 'type' => 'string' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			$page = get_post( (int) $input['id'] );
			if ( ! $page || $page->post_type !== 'page' ) {
				return new WP_Error( 'not_found', 'Side ikke fundet' );
			}

			$args = [ 'ID' => $page->ID ];

			if ( isset( $input['title'] ) ) {
				$args['post_title'] = sanitize_text_field( $input['title'] );
			}
			if ( isset( $input['content'] ) ) {
				$args['post_content'] = wp_kses_post( $input['content'] );
			}
			if ( isset( $input['slug'] ) ) {
				$args['post_name'] = sanitize_title( $input['slug'] );
			}
			if ( isset( $input['status'] ) && in_array( $input['status'], [ 'publish', 'draft', 'private' ], true ) ) {
				$args['post_status'] = $input['status'];
			}
			if ( isset( $input['excerpt'] ) ) {
				$args['post_excerpt'] = sanitize_text_field( $input['excerpt'] );
			}

			$result = wp_update_post( $args, true );
			if ( is_wp_error( $result ) ) {
				return $result;
			}

			if ( isset( $input['template'] ) ) {
				update_post_meta( $page->ID, '_wp_page_template', sanitize_text_field( $input['template'] ) );
			}

			lpa_save_seo_data( $page->ID, $input );

			return [
				'id'  => $page->ID,
				'url' => get_permalink( $page->ID ),
			];
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
	] );

	wp_register_ability( 'landing-pages/delete-page', [
		'label'       => __( 'Slet side', 'landing-page-abilities' ),
		'description' => __( 'Flytter en side til papirkurven.', 'landing-page-abilities' ),
		'category'    => 'content',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'id' => [ 'type' => 'integer', 'description' => 'Side-ID' ],
			],
			'required' => [ 'id' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'success' => [ 'type' => 'boolean' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			$result = wp_trash_post( (int) $input['id'] );
			return [ 'success' => (bool) $result ];
		},
		'permission_callback' => function () {
			return current_user_can( 'delete_pages' );
		},
	] );

	// -------------------------------------------------------------------------
	// SIDER - TEMPLATES
	// -------------------------------------------------------------------------

	wp_register_ability( 'landing-pages/list-page-templates', [
		'label'       => __( 'List sidetemplates', 'landing-page-abilities' ),
		'description' => __( 'Returnerer alle tilgængelige sidetemplates fra det aktive tema.', 'landing-page-abilities' ),
		'category'    => 'content',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'output_schema' => [
			'type'  => 'array',
			'items' => [
				'type'       => 'object',
				'properties' => [
					'filename' => [ 'type' => 'string' ],
					'label'    => [ 'type' => 'string' ],
				],
			],
		],
		'execute_callback'    => function () {
			$templates = wp_get_theme()->get_page_templates();
			$result    = [ [ 'filename' => 'default', 'label' => 'Standard' ] ];
			foreach ( $templates as $filename => $label ) {
				$result[] = [ 'filename' => $filename, 'label' => $label ];
			}
			return $result;
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
	] );

	// -------------------------------------------------------------------------
	// MEDIER
	// -------------------------------------------------------------------------

	wp_register_ability( 'landing-pages/list-media', [
		'label'       => __( 'List mediefiler', 'landing-page-abilities' ),
		'description' => __( 'Returnerer en liste af uploadede billeder og filer.', 'landing-page-abilities' ),
		'category'    => 'media',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'type'     => [
					'type'        => 'string',
					'description' => 'Filtrer på MIME-type, f.eks. image, image/jpeg',
					'default'     => 'image',
				],
				'per_page' => [
					'type'    => 'integer',
					'default' => 30,
				],
				'search'   => [
					'type'        => 'string',
					'description' => 'Søg i filnavn/titel',
				],
			],
		],
		'output_schema' => [
			'type'  => 'array',
			'items' => [
				'type'       => 'object',
				'properties' => [
					'id'          => [ 'type' => 'integer' ],
					'title'       => [ 'type' => 'string' ],
					'filename'    => [ 'type' => 'string' ],
					'url'         => [ 'type' => 'string' ],
					'thumbnail'   => [ 'type' => 'string' ],
					'mime_type'   => [ 'type' => 'string' ],
					'alt'         => [ 'type' => 'string' ],
					'description' => [ 'type' => 'string' ],
					'width'       => [ 'type' => [ 'integer', 'null' ] ],
					'height'      => [ 'type' => [ 'integer', 'null' ] ],
					'filesize'    => [ 'type' => [ 'integer', 'null' ] ],
				],
			],
		],
		'execute_callback'    => function ( $input ) {
			$args = [
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'posts_per_page' => min( (int) ( $input['per_page'] ?? 30 ), 100 ),
				'post_mime_type' => $input['type'] ?? 'image',
			];

			if ( ! empty( $input['search'] ) ) {
				$args['s'] = sanitize_text_field( $input['search'] );
			}

			$attachments = get_posts( $args );

			return array_map( function ( $att ) {
				$meta      = wp_get_attachment_metadata( $att->ID );
				$thumb_url = wp_get_attachment_image_url( $att->ID, 'thumbnail' ) ?: get_attachment_link( $att->ID );

				return [
					'id'          => $att->ID,
					'title'       => $att->post_title,
					'filename'    => basename( get_attached_file( $att->ID ) ?? '' ),
					'url'         => wp_get_attachment_url( $att->ID ),
					'thumbnail'   => $thumb_url,
					'mime_type'   => $att->post_mime_type,
					'alt'         => get_post_meta( $att->ID, '_wp_attachment_image_alt', true ) ?? '',
					'description' => $att->post_content,
					'width'       => $meta['width'] ?? null,
					'height'      => $meta['height'] ?? null,
					'filesize'    => $meta['filesize'] ?? null,
				];
			}, $attachments );
		},
		'permission_callback' => function () {
			return current_user_can( 'upload_files' );
		},
	] );

	wp_register_ability( 'landing-pages/update-media-meta', [
		'label'       => __( 'Opdater medie-metadata', 'landing-page-abilities' ),
		'description' => __( 'Opdaterer alt-tekst, titel og beskrivelse på et medieobjekt.', 'landing-page-abilities' ),
		'category'    => 'media',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'id'          => [ 'type' => 'integer', 'description' => 'Medie-ID' ],
				'alt'         => [ 'type' => 'string', 'description' => 'Alt-tekst' ],
				'title'       => [ 'type' => 'string', 'description' => 'Titel' ],
				'description' => [ 'type' => 'string', 'description' => 'Beskrivelse/caption' ],
			],
			'required' => [ 'id' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'success' => [ 'type' => 'boolean' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			$id = (int) $input['id'];
			if ( ! get_post( $id ) ) {
				return new WP_Error( 'not_found', 'Mediefil ikke fundet' );
			}

			if ( isset( $input['alt'] ) ) {
				update_post_meta( $id, '_wp_attachment_image_alt', sanitize_text_field( $input['alt'] ) );
			}

			$args = [ 'ID' => $id ];
			if ( isset( $input['title'] ) ) {
				$args['post_title'] = sanitize_text_field( $input['title'] );
			}
			if ( isset( $input['description'] ) ) {
				$args['post_content'] = sanitize_textarea_field( $input['description'] );
			}

			if ( count( $args ) > 1 ) {
				wp_update_post( $args );
			}

			return [ 'success' => true ];
		},
		'permission_callback' => function () {
			return current_user_can( 'upload_files' );
		},
	] );

	wp_register_ability( 'landing-pages/set-featured-image', [
		'label'       => __( 'Sæt fremhævet billede', 'landing-page-abilities' ),
		'description' => __( 'Sætter et eksisterende medieobjekt som fremhævet billede på en side.', 'landing-page-abilities' ),
		'category'    => 'media',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'page_id'  => [ 'type' => 'integer', 'description' => 'Side-ID' ],
				'media_id' => [ 'type' => 'integer', 'description' => 'Medie-ID (0 = fjern billede)' ],
			],
			'required' => [ 'page_id', 'media_id' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'success' => [ 'type' => 'boolean' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			$page_id  = (int) $input['page_id'];
			$media_id = (int) $input['media_id'];

			if ( $media_id === 0 ) {
				delete_post_thumbnail( $page_id );
			} else {
				set_post_thumbnail( $page_id, $media_id );
			}

			return [ 'success' => true ];
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
	] );

	// -------------------------------------------------------------------------
	// SEO
	// -------------------------------------------------------------------------

	wp_register_ability( 'landing-pages/get-seo', [
		'label'       => __( 'Hent SEO-metadata', 'landing-page-abilities' ),
		'description' => __( 'Returnerer SEO-titel, meta-beskrivelse og Open Graph data for en side. Understøtter Yoast SEO og Rank Math.', 'landing-page-abilities' ),
		'category'    => 'seo',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'id' => [ 'type' => 'integer', 'description' => 'Side-ID' ],
			],
			'required' => [ 'id' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'seo_title'       => [ 'type' => 'string' ],
				'seo_description' => [ 'type' => 'string' ],
				'og_title'        => [ 'type' => 'string' ],
				'og_description'  => [ 'type' => 'string' ],
				'og_image'        => [ 'type' => 'string' ],
				'canonical'       => [ 'type' => 'string' ],
				'noindex'         => [ 'type' => 'boolean' ],
				'plugin'          => [ 'type' => 'string' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			return lpa_get_seo_data( (int) $input['id'] );
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
	] );

	wp_register_ability( 'landing-pages/update-seo', [
		'label'       => __( 'Opdater SEO-metadata', 'landing-page-abilities' ),
		'description' => __( 'Opdaterer SEO-titel, meta-beskrivelse og Open Graph data for en side. Understøtter Yoast SEO og Rank Math.', 'landing-page-abilities' ),
		'category'    => 'seo',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'id'              => [ 'type' => 'integer', 'description' => 'Side-ID' ],
				'seo_title'       => [ 'type' => 'string', 'description' => 'SEO meta-titel' ],
				'seo_description' => [ 'type' => 'string', 'description' => 'SEO meta-beskrivelse' ],
				'og_title'        => [ 'type' => 'string', 'description' => 'Open Graph titel' ],
				'og_description'  => [ 'type' => 'string', 'description' => 'Open Graph beskrivelse' ],
				'noindex'         => [ 'type' => 'boolean', 'description' => 'Sæt til true for at skjule siden fra søgemaskiner' ],
			],
			'required' => [ 'id' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'success' => [ 'type' => 'boolean' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			lpa_save_seo_data( (int) $input['id'], $input );
			return [ 'success' => true ];
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
	] );

	// -------------------------------------------------------------------------
	// NAVIGATION / MENUS
	// -------------------------------------------------------------------------

	wp_register_ability( 'landing-pages/list-menus', [
		'label'       => __( 'List navigationsmenuer', 'landing-page-abilities' ),
		'description' => __( 'Returnerer alle registrerede navigationsmenuer og deres lokationer.', 'landing-page-abilities' ),
		'category'    => 'content',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'output_schema' => [
			'type'  => 'array',
			'items' => [
				'type'       => 'object',
				'properties' => [
					'id'        => [ 'type' => 'integer' ],
					'name'      => [ 'type' => 'string' ],
					'slug'      => [ 'type' => 'string' ],
					'locations' => [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
					'count'     => [ 'type' => 'integer' ],
				],
			],
		],
		'execute_callback'    => function () {
			$menus     = wp_get_nav_menus();
			$locations = get_nav_menu_locations();
			// Invert location map: menu_id => [location_slugs]
			$loc_map = [];
			foreach ( $locations as $loc => $menu_id ) {
				$loc_map[ $menu_id ][] = $loc;
			}

			return array_map( function ( $menu ) use ( $loc_map ) {
				return [
					'id'        => $menu->term_id,
					'name'      => $menu->name,
					'slug'      => $menu->slug,
					'locations' => $loc_map[ $menu->term_id ] ?? [],
					'count'     => $menu->count,
				];
			}, $menus );
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_theme_options' );
		},
	] );

	// -------------------------------------------------------------------------
	// ELEMENTOR / BLOK-EDITOR HJÆLP
	// -------------------------------------------------------------------------

	wp_register_ability( 'landing-pages/get-elementor-data', [
		'label'       => __( 'Hent Elementor-data', 'landing-page-abilities' ),
		'description' => __( 'Returnerer rå Elementor JSON (_elementor_data) og page settings fra en side. Bruges til at kopiere struktur/design til en ny side.', 'landing-page-abilities' ),
		'category'    => 'content',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'id' => [ 'type' => 'integer', 'description' => 'Side-ID' ],
			],
			'required' => [ 'id' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'elementor_data'          => [ 'type' => 'string', 'description' => 'Rå Elementor JSON (_elementor_data)' ],
				'elementor_page_settings' => [ 'type' => 'string', 'description' => 'Serialiseret Elementor page settings' ],
				'edit_mode'               => [ 'type' => 'string', 'description' => 'Elementor edit mode (builder/disabled)' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			$page_id = (int) $input['id'];
			$page    = get_post( $page_id );
			if ( ! $page || $page->post_type !== 'page' ) {
				return new WP_Error( 'not_found', 'Side ikke fundet' );
			}

			$page_settings = get_post_meta( $page_id, '_elementor_page_settings', true );
			if ( is_array( $page_settings ) ) {
				$page_settings = wp_json_encode( $page_settings );
			}

			return [
				'elementor_data'          => get_post_meta( $page_id, '_elementor_data', true ) ?: '',
				'elementor_page_settings' => $page_settings ?: '',
				'edit_mode'               => get_post_meta( $page_id, '_elementor_edit_mode', true ) ?: '',
			];
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
	] );

	wp_register_ability( 'landing-pages/set-elementor-data', [
		'label'       => __( 'Sæt Elementor-data', 'landing-page-abilities' ),
		'description' => __( 'Skriver Elementor JSON direkte til en side og sætter edit mode til builder. Bruges til at overføre design fra én side til en anden.', 'landing-page-abilities' ),
		'category'    => 'content',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'id'                      => [ 'type' => 'integer', 'description' => 'Side-ID der skal opdateres' ],
				'elementor_data'          => [ 'type' => 'string', 'description' => 'Rå Elementor JSON' ],
				'elementor_page_settings' => [ 'type' => 'string', 'description' => 'Serialiseret Elementor page settings (valgfri)' ],
			],
			'required' => [ 'id', 'elementor_data' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'success' => [ 'type' => 'boolean' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			$page_id = (int) $input['id'];
			$page    = get_post( $page_id );
			if ( ! $page || $page->post_type !== 'page' ) {
				return new WP_Error( 'not_found', 'Side ikke fundet' );
			}

			// Validér at det er valid JSON
			$decoded = json_decode( $input['elementor_data'] );
			if ( json_last_error() !== JSON_ERROR_NONE ) {
				return new WP_Error( 'invalid_json', 'elementor_data er ikke valid JSON: ' . json_last_error_msg() );
			}

			update_post_meta( $page_id, '_elementor_data', $input['elementor_data'] );
			update_post_meta( $page_id, '_elementor_edit_mode', 'builder' );
			update_post_meta( $page_id, '_elementor_version', '3.32.3' );

			// Slet cached CSS så Elementor regenererer
			delete_post_meta( $page_id, '_elementor_css' );

			if ( ! empty( $input['elementor_page_settings'] ) ) {
				update_post_meta( $page_id, '_elementor_page_settings', $input['elementor_page_settings'] );
			}

			// Opdater post_content med Elementor placeholder
			wp_update_post( [
				'ID'           => $page_id,
				'post_content' => '',
			] );

			return [ 'success' => true ];
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
	] );

	wp_register_ability( 'landing-pages/clear-elementor-data', [
		'label'       => __( 'Ryd Elementor-data', 'landing-page-abilities' ),
		'description' => __( 'Sletter Elementor post_meta fra en side så den kan redigeres i Gutenberg blok-editoren.', 'landing-page-abilities' ),
		'category'    => 'content',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'id' => [ 'type' => 'integer', 'description' => 'Side-ID' ],
			],
			'required' => [ 'id' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'success'  => [ 'type' => 'boolean' ],
				'removed'  => [ 'type' => 'array', 'items' => [ 'type' => 'string' ], 'description' => 'Liste over slettede meta-nøgler' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			$page_id = (int) $input['id'];
			$page    = get_post( $page_id );
			if ( ! $page || $page->post_type !== 'page' ) {
				return new WP_Error( 'not_found', 'Side ikke fundet' );
			}

			$keys_to_remove = [
				'_elementor_data',
				'_elementor_edit_mode',
				'_elementor_template_type',
				'_elementor_version',
				'_elementor_pro_version',
				'_elementor_css',
			];

			$removed = [];
			foreach ( $keys_to_remove as $key ) {
				if ( metadata_exists( 'post', $page_id, $key ) ) {
					delete_post_meta( $page_id, $key );
					$removed[] = $key;
				}
			}

			return [
				'success' => true,
				'removed' => $removed,
			];
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_pages' );
		},
	] );

	wp_register_ability( 'landing-pages/add-page-to-menu', [
		'label'       => __( 'Tilføj side til menu', 'landing-page-abilities' ),
		'description' => __( 'Tilføjer en side som menupunkt i en eksisterende navigationsmenu.', 'landing-page-abilities' ),
		'category'    => 'content',
		'meta'        => [ 'mcp' => [ 'public' => true ] ],
		'input_schema' => [
			'type'       => 'object',
			'properties' => [
				'menu_id'   => [ 'type' => 'integer', 'description' => 'Menu-ID' ],
				'page_id'   => [ 'type' => 'integer', 'description' => 'Side-ID' ],
				'title'     => [ 'type' => 'string', 'description' => 'Overskrift i menuen (valgfri - bruger sidetitel som standard)' ],
				'parent_id' => [ 'type' => 'integer', 'description' => 'Overordnet menupunkt-ID (valgfri)' ],
			],
			'required' => [ 'menu_id', 'page_id' ],
		],
		'output_schema' => [
			'type'       => 'object',
			'properties' => [
				'menu_item_id' => [ 'type' => 'integer' ],
			],
		],
		'execute_callback'    => function ( $input ) {
			$args = [
				'menu-item-object-id' => (int) $input['page_id'],
				'menu-item-object'    => 'page',
				'menu-item-type'      => 'post_type',
				'menu-item-status'    => 'publish',
			];

			if ( ! empty( $input['title'] ) ) {
				$args['menu-item-title'] = sanitize_text_field( $input['title'] );
			}
			if ( ! empty( $input['parent_id'] ) ) {
				$args['menu-item-parent-id'] = (int) $input['parent_id'];
			}

			$item_id = wp_update_nav_menu_item( (int) $input['menu_id'], 0, $args );
			if ( is_wp_error( $item_id ) ) {
				return $item_id;
			}

			return [ 'menu_item_id' => $item_id ];
		},
		'permission_callback' => function () {
			return current_user_can( 'edit_theme_options' );
		},
	] );

} );

// =============================================================================
// HJÆLPEFUNKTIONER
// =============================================================================

/**
 * Henter SEO-data for en given post.
 * Understøtter Yoast SEO, Rank Math og fallback til standard WordPress-felter.
 */
function lpa_get_seo_data( int $post_id ): array {
	// Yoast SEO
	if ( defined( 'WPSEO_VERSION' ) ) {
		return [
			'seo_title'       => get_post_meta( $post_id, '_yoast_wpseo_title', true ) ?? '',
			'seo_description' => get_post_meta( $post_id, '_yoast_wpseo_metadesc', true ) ?? '',
			'og_title'        => get_post_meta( $post_id, '_yoast_wpseo_opengraph-title', true ) ?? '',
			'og_description'  => get_post_meta( $post_id, '_yoast_wpseo_opengraph-description', true ) ?? '',
			'og_image'        => get_post_meta( $post_id, '_yoast_wpseo_opengraph-image', true ) ?? '',
			'canonical'       => get_post_meta( $post_id, '_yoast_wpseo_canonical', true ) ?? '',
			'noindex'         => get_post_meta( $post_id, '_yoast_wpseo_meta-robots-noindex', true ) === '1',
			'plugin'          => 'yoast',
		];
	}

	// Rank Math
	if ( defined( 'RANK_MATH_VERSION' ) ) {
		return [
			'seo_title'       => get_post_meta( $post_id, 'rank_math_title', true ) ?? '',
			'seo_description' => get_post_meta( $post_id, 'rank_math_description', true ) ?? '',
			'og_title'        => get_post_meta( $post_id, 'rank_math_facebook_title', true ) ?? '',
			'og_description'  => get_post_meta( $post_id, 'rank_math_facebook_description', true ) ?? '',
			'og_image'        => get_post_meta( $post_id, 'rank_math_facebook_image', true ) ?? '',
			'canonical'       => get_post_meta( $post_id, 'rank_math_canonical_url', true ) ?? '',
			'noindex'         => get_post_meta( $post_id, 'rank_math_robots', true ) === 'noindex',
			'plugin'          => 'rankmath',
		];
	}

	// Ingen SEO-plugin - returner tomme felter
	return [
		'seo_title'       => '',
		'seo_description' => '',
		'og_title'        => '',
		'og_description'  => '',
		'og_image'        => '',
		'canonical'       => '',
		'noindex'         => false,
		'plugin'          => 'none',
	];
}

/**
 * Gemmer SEO-data for en given post.
 * Understøtter Yoast SEO og Rank Math.
 */
function lpa_save_seo_data( int $post_id, array $input ): void {
	// Yoast SEO
	if ( defined( 'WPSEO_VERSION' ) ) {
		if ( isset( $input['seo_title'] ) ) {
			update_post_meta( $post_id, '_yoast_wpseo_title', sanitize_text_field( $input['seo_title'] ) );
		}
		if ( isset( $input['seo_description'] ) ) {
			update_post_meta( $post_id, '_yoast_wpseo_metadesc', sanitize_textarea_field( $input['seo_description'] ) );
		}
		if ( isset( $input['og_title'] ) ) {
			update_post_meta( $post_id, '_yoast_wpseo_opengraph-title', sanitize_text_field( $input['og_title'] ) );
		}
		if ( isset( $input['og_description'] ) ) {
			update_post_meta( $post_id, '_yoast_wpseo_opengraph-description', sanitize_textarea_field( $input['og_description'] ) );
		}
		if ( isset( $input['noindex'] ) ) {
			update_post_meta( $post_id, '_yoast_wpseo_meta-robots-noindex', $input['noindex'] ? '1' : '0' );
		}
		return;
	}

	// Rank Math
	if ( defined( 'RANK_MATH_VERSION' ) ) {
		if ( isset( $input['seo_title'] ) ) {
			update_post_meta( $post_id, 'rank_math_title', sanitize_text_field( $input['seo_title'] ) );
		}
		if ( isset( $input['seo_description'] ) ) {
			update_post_meta( $post_id, 'rank_math_description', sanitize_textarea_field( $input['seo_description'] ) );
		}
		if ( isset( $input['og_title'] ) ) {
			update_post_meta( $post_id, 'rank_math_facebook_title', sanitize_text_field( $input['og_title'] ) );
		}
		if ( isset( $input['og_description'] ) ) {
			update_post_meta( $post_id, 'rank_math_facebook_description', sanitize_textarea_field( $input['og_description'] ) );
		}
		if ( isset( $input['noindex'] ) ) {
			update_post_meta( $post_id, 'rank_math_robots', $input['noindex'] ? 'noindex' : '' );
		}
	}
}
