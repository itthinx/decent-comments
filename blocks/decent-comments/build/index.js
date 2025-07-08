/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/block.json":
/*!************************!*\
  !*** ./src/block.json ***!
  \************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"apiVersion":3,"name":"decent-comments-block/decent-comments","title":"Decent Comments","category":"widgets","icon":"admin-comments","description":"Displays comments with customizable options using the Decent Comments plugin via REST API.","keywords":["comments","decent comments","widget"],"supports":{"html":false},"attributes":{"title":{"type":"string","default":""},"number":{"type":"number","default":5},"offset":{"type":"number","default":0},"post_id":{"type":"string","default":""},"post__in":{"type":"string","default":""},"post__not_in":{"type":"string","default":""},"post_tag":{"type":"string","default":""},"exclude_post_author":{"type":"boolean","default":false},"show_author":{"type":"boolean","default":true},"show_date":{"type":"boolean","default":true},"link_authors":{"type":"boolean","default":true},"show_avatar":{"type":"boolean","default":true},"avatar_size":{"type":"number","default":48},"show_link":{"type":"boolean","default":true},"show_excerpt":{"type":"boolean","default":true},"max_excerpt_words":{"type":"number","default":20},"max_excerpt_characters":{"type":"number","default":0},"ellipsis":{"type":"string","default":""},"strip_tags":{"type":"boolean","default":true},"order":{"type":"string","default":"desc"},"orderby":{"type":"string","default":"date_gmt"},"show_post_title":{"type":"boolean","default":false},"class":{"type":"string","default":""},"post_type":{"type":"string","default":"post"}},"textdomain":"decent-comments","editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./style-index.css","viewScript":"file:./view.js","script":"file:./commentsUtils.js"}');

/***/ }),

/***/ "./src/commentsUtils.js":
/*!******************************!*\
  !*** ./src/commentsUtils.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildQuery: () => (/* binding */ buildQuery),
/* harmony export */   fetchComments: () => (/* binding */ fetchComments),
/* harmony export */   formatExcerpt: () => (/* binding */ formatExcerpt),
/* harmony export */   handleError: () => (/* binding */ handleError),
/* harmony export */   initializeComments: () => (/* binding */ initializeComments),
/* harmony export */   parseAttributes: () => (/* binding */ parseAttributes),
/* harmony export */   processCommentBlock: () => (/* binding */ processCommentBlock),
/* harmony export */   renderComment: () => (/* binding */ renderComment),
/* harmony export */   renderComments: () => (/* binding */ renderComments),
/* harmony export */   sanitizeHTML: () => (/* binding */ sanitizeHTML)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/**
 * commentsUtils.js
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
 * @author George Tsiokos
 * @package decent-comments
 * @since decent-comments 3.0.0
 */



async function initializeComments() {
  const blocks = document.querySelectorAll('.wp-block-itthinx-decent-comments');
  for (const block of blocks) {
    try {
      await processCommentBlock(block);
    } catch (error) {
      handleError(block, error);
    }
  }
}
async function processCommentBlock(block) {
  const attributes = parseAttributes(block.dataset.attributes);
  if (attributes.post_id === '[current]' || attributes.post_id === '{current}') {
    if (current_post_id) {
      attributes.post_id = current_post_id;
    }
  }
  if (attributes.terms === '[current]' || attributes.terms === '{current}') {
    if (current_term_id) {
      attributes.term_ids = current_term_id;
    }
  }
  let comments = await fetchComments(attributes);
  const html = renderComments(comments.comments, attributes);
  block.innerHTML = html;
}
function parseAttributes(data) {
  return JSON.parse(data || '{}');
}
async function fetchComments(attributes, nonce) {
  const query = buildQuery(attributes);
  const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
    path: `decent-comments/v1/comments?${query.toString()}`,
    method: 'GET',
    headers: {
      'X-WP-Nonce': nonce
    }
  });
  return response;
}
function buildQuery(attributes) {
  const params = {
    number: attributes.number || 5,
    offset: attributes.offset || 0,
    order: attributes.order || 'asc',
    orderby: attributes.orderby || 'comment_author_email',
    ...(attributes.post_id && {
      post_id: attributes.post_id
    }),
    ...(attributes.post__in && {
      post__in: attributes.post__in
    }),
    ...(attributes.post__not_in && {
      post__not_in: attributes.post__not_in
    }),
    ...(attributes.post_type && {
      post_type: attributes.post_type
    }),
    ...(attributes.taxonomy && {
      taxonomy: attributes.taxonomy
    }),
    ...(attributes.terms && {
      terms: attributes.terms
    }),
    ...(attributes.term_ids && {
      term_ids: attributes.term_ids
    }),
    ...(attributes.exclude_post_author && {
      exclude_post_author: attributes.exclude_post_author
    }),
    ...(attributes.pingback && {
      pingback: attributes.pingback
    }),
    ...(attributes.trackback && {
      trackback: attributes.trackback
    })
  };
  return new URLSearchParams(params);
}
function renderComments(comments, attributes) {
  let output = '<div class="decent-comments">';
  if (attributes.title?.length > 0) {
    output += `<div class="decent-comments-heading gamma widget-title">${sanitizeHTML(attributes.title)}</div>`;
  }
  output += '<ul class="decent-comments">';
  if (comments.length === 0) {
    output += `<li>${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('No Comments', 'decent-comments')}</li>`;
  } else {
    output += comments.filter(comment => !attributes.exclude_post_author || comment.author_email !== comment.post_author).map(comment => renderComment(comment, attributes)).join('');
  }
  output += '</ul></div>';
  return output;
}
function renderComment(comment, attributes) {
  const author = attributes.show_author ? attributes.link_authors && comment.author_url ? `<a href="${sanitizeHTML(comment.author_url)}" class="comment-author-link">${sanitizeHTML(comment.author)}</a>` : comment.author : '';
  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour12: true
  };
  const date = attributes.show_date ? `${new Date(comment.date).toLocaleDateString(undefined, dateOptions)} ${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('at', 'decent-comments')} ${new Date(comment.date).toLocaleTimeString()}` : '';
  const avatar = attributes.show_avatar && comment.avatar ? `<img src="${sanitizeHTML(comment.avatar)}" alt="${sanitizeHTML(author)}" width="${attributes.avatar_size || 48}" height="${attributes.avatar_size || 48}" />` : '';
  const excerpt = attributes.show_comment ? formatExcerpt(comment.content, attributes) : '';
  const postTitle = attributes.show_link && comment.comment_link ? `${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('on', 'decent-comments')} <a href="${sanitizeHTML(comment.comment_link || '#')}" class="comment-post-title">${sanitizeHTML(comment.post_title || '')}</a>` : '';
  return `
		<li class="comment">
			${avatar}
			<div class="comment-content">
				${author ? `<span class="comment-author">${author}</span>` : ''}
				${date ? `<span class="comment-date">${date}</span>` : ''}
				${postTitle}
				<span class="comment-excerpt">${excerpt}</span>
			</div>
		</li>`;
}
function formatExcerpt(content, attributes) {
  let excerpt = attributes.show_excerpt ? content : '';
  if (attributes.strip_tags) {
    excerpt = excerpt.replace(/(<([^>]+)>)/gi, '');
  }
  if (attributes.max_excerpt_words > 0) {
    const words = excerpt.split(' ');
    excerpt = words.slice(0, attributes.max_excerpt_words).join(' ') + (words.length > attributes.max_excerpt_words ? sanitizeHTML(attributes.ellipsis) : '');
  }
  if (attributes.max_excerpt_characters > 0) {
    excerpt = excerpt.substring(0, attributes.max_excerpt_characters) + (excerpt.length > attributes.max_excerpt_characters ? sanitizeHTML(attributes.ellipsis) : '');
  }
  return sanitizeHTML(excerpt);
}
function handleError(block, error) {
  block.innerHTML = `<p>${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Error loading comments', 'decent-comments')}</p>`;
  console.error('Decent Comments Error:', error);
}
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


/***/ }),

/***/ "./src/index.css":
/*!***********************!*\
  !*** ./src/index.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "@wordpress/api-fetch":
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["apiFetch"];

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./index.css */ "./src/index.css");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./block.json */ "./src/block.json");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _commentsUtils_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./commentsUtils.js */ "./src/commentsUtils.js");

/**
 * index.js
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
 * @author George Tsiokos
 * @package decent-comments
 * @since decent-comments 3.0.0
 */









(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_1__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_6__.name, {
  apiVersion: 3,
  title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Decent Comments', 'decent-comments'),
  icon: 'admin-comments',
  category: 'widgets',
  attributes: {
    title: {
      type: 'string',
      default: ''
    },
    number: {
      type: 'number',
      default: 5
    },
    offset: {
      type: 'number',
      default: 0
    },
    post_id: {
      type: 'string',
      default: ''
    },
    post__in: {
      type: 'string',
      default: ''
    },
    post__not_in: {
      type: 'string',
      default: ''
    },
    post_tag: {
      type: 'string',
      default: ''
    },
    exclude_post_author: {
      type: 'boolean',
      default: false
    },
    show_author: {
      type: 'boolean',
      default: true
    },
    show_date: {
      type: 'boolean',
      default: true
    },
    link_authors: {
      type: 'boolean',
      default: true
    },
    show_avatar: {
      type: 'boolean',
      default: true
    },
    avatar_size: {
      type: 'number',
      default: 48
    },
    show_link: {
      type: 'boolean',
      default: true
    },
    show_comment: {
      type: 'boolean',
      default: true
    },
    taxonomy: {
      type: 'string',
      default: ''
    },
    terms: {
      type: 'string',
      default: ''
    },
    pingback: {
      type: 'boolean',
      default: true
    },
    trackback: {
      type: 'boolean',
      default: true
    },
    show_excerpt: {
      type: 'boolean',
      default: true
    },
    max_excerpt_words: {
      type: 'number',
      default: 20
    },
    max_excerpt_characters: {
      type: 'number',
      default: 0
    },
    ellipsis: {
      type: 'string',
      default: ''
    },
    strip_tags: {
      type: 'boolean',
      default: true
    },
    order: {
      type: 'string',
      default: 'desc'
    },
    orderby: {
      type: 'string',
      default: 'comment_date_gmt'
    },
    class: {
      type: 'string',
      default: ''
    },
    post_type: {
      type: 'string',
      default: 'post'
    }
  },
  edit: ({
    attributes,
    setAttributes
  }) => {
    const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.useBlockProps)();
    const [comments, setComments] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.useState)([]);
    const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.useState)(null);
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_7__.useEffect)(() => {
      const getComments = async () => {
        try {
          // Handle current_post_id and current_term_id
          const updatedAttributes = {
            ...attributes
          };
          if (attributes.post_id === '[current]' || attributes.post_id === '{current}') {
            updatedAttributes.post_id = '';
          }
          if (attributes.terms === '[current]' || attributes.terms === '{current}') {
            updatedAttributes.term_ids = '';
          }
          const nonce = window.decentCommentsEdit?.nonce || '';
          const response = await (0,_commentsUtils_js__WEBPACK_IMPORTED_MODULE_8__.fetchComments)(updatedAttributes, nonce);
          setComments(response.comments || []);
          setError(null);
        } catch (err) {
          setError(err);
          setComments([]);
        }
      };
      getComments();
    }, [attributes]);
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Comment Settings', 'decent-comments')
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Title', 'decent-comments'),
      value: attributes.title,
      onChange: value => setAttributes({
        title: value
      }),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Number of Comments', 'decent-comments'),
      value: attributes.number,
      onChange: value => setAttributes({
        number: parseInt(value) || 5
      }),
      min: "1",
      type: "number",
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.SelectControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Order by...', 'decent-comments'),
      value: attributes.orderby,
      options: [{
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Author Email', 'decent-comments'),
        value: 'comment_author_email'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Author URL', 'decent-comments'),
        value: 'comment_author_url'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Content', 'decent-comments'),
        value: 'comment_content'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Comment Date', 'decent-comments'),
        value: 'comment_date_gmt'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Karma', 'decent-comments'),
        value: 'comment_karma'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Post', 'decent-comments'),
        value: 'comment_post_id'
      }],
      onChange: value => setAttributes({
        orderby: value
      }),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.SelectControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Sort order', 'decent-comments'),
      value: attributes.order,
      options: [{
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Descending', 'decent-comments'),
        value: 'desc'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Ascending', 'decent-comments'),
        value: 'asc'
      }],
      onChange: value => setAttributes({
        order: value
      }),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Post ID', 'decent-comments'),
      value: attributes.post_id,
      onChange: value => setAttributes({
        post_id: value || ''
      }),
      help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Title, empty, post ID or [current]', 'decent-comments'),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Post type', 'decent-comments'),
      value: attributes.post_type,
      onChange: value => setAttributes({
        post_type: value
      }),
      help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Available post types: ' + decentCommentsEdit.post_types, 'decent-comments'),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Exclude comments from post authors', 'decent-comments'),
      checked: attributes.exclude_post_author,
      onChange: value => setAttributes({
        exclude_post_author: value
      }),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Show comment excerpt', 'decent-comments'),
      checked: attributes.show_excerpt,
      onChange: value => setAttributes({
        show_excerpt: value
      }),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Number of words in excerpts', 'decent-comments'),
      value: attributes.max_excerpt_words,
      onChange: value => setAttributes({
        max_excerpt_words: parseInt(value) || 20
      }),
      min: "0",
      type: "number",
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Number of characters in excerpts', 'decent-comments'),
      value: attributes.max_excerpt_characters,
      onChange: value => setAttributes({
        max_excerpt_characters: parseInt(value) || 0
      }),
      min: "0",
      type: "number",
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Ellipsis'),
      value: attributes.ellipsis,
      onChange: value => setAttributes({
        ellipsis: value
      }),
      help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('The ellipsis is shown after the excerpt when there is more content.', 'decent-comments'),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Show author', 'decent-comments'),
      checked: attributes.show_author,
      onChange: value => setAttributes({
        show_author: value
      }),
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Show date', 'decent-comments'),
      checked: attributes.show_date,
      onChange: value => setAttributes({
        show_date: value
      }),
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Link authors', 'decent-comments'),
      checked: attributes.link_authors,
      onChange: value => setAttributes({
        link_authors: value
      }),
      help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Whether to link comment authors to their website.', 'decent-comments'),
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Show avatar', 'decent-comments'),
      checked: attributes.show_avatar,
      onChange: value => setAttributes({
        show_avatar: value
      }),
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Avatar size', 'decent-comments'),
      value: attributes.avatar_size,
      onChange: value => setAttributes({
        avatar_size: parseInt(value) || 48
      }),
      min: "0",
      type: "number",
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Show link to post', 'decent-comments'),
      checked: attributes.show_link,
      onChange: value => setAttributes({
        show_link: value
      }),
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Show the comment', 'decent-comments'),
      checked: attributes.show_comment,
      onChange: value => setAttributes({
        show_comment: value
      }),
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.SelectControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Taxonomy', 'decent-comments'),
      value: attributes.taxonomy,
      options: [{
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('All post taxonomies', 'decent-comments'),
        value: ''
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('category', 'decent-comments'),
        value: 'category'
      }, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('tag', 'decent-comments'),
        value: 'post_tag'
      }],
      onChange: value => setAttributes({
        taxonomy: value
      }),
      help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Select category if you would like to show comments on posts in certain categories. Give the desired categories\' slugs in Term. For tags select post_tag and give the tags\' slugs in Term.', 'decent-comments'),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Term', 'decent-comments'),
      value: attributes.terms,
      onChange: value => setAttributes({
        terms: value
      }),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Pingbacks', 'decent-comments'),
      checked: attributes.pingback,
      onChange: value => setAttributes({
        pingback: value
      }),
      __nextHasNoMarginBottom: true
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Trackbacks', 'decent-comments'),
      checked: attributes.trackback,
      onChange: value => setAttributes({
        trackback: value
      }),
      __nextHasNoMarginBottom: true
    }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      ...(0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.useBlockProps)({
        className: 'wp-block-itthinx-decent-comments',
        'data-attributes': JSON.stringify(attributes)
      })
    }, error ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Error loading comments in editor', 'decent-comments')) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "wp-block-itthinx-decent-comments",
      "data-attributes": JSON.stringify(attributes),
      dangerouslySetInnerHTML: {
        __html: (0,_commentsUtils_js__WEBPACK_IMPORTED_MODULE_8__.renderComments)(comments, attributes)
      }
    })));
  },
  save: ({
    attributes
  }) => {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "wp-block-itthinx-decent-comments",
      "data-attributes": JSON.stringify(attributes)
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Decent Comments Placeholder', 'decent-comments')));
  }
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map