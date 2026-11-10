/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/commentsUtils.js"
/*!******************************!*\
  !*** ./src/commentsUtils.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderComment: () => (/* binding */ RenderComment),
/* harmony export */   RenderComments: () => (/* binding */ RenderComments),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   fetchComments: () => (/* binding */ fetchComments),
/* harmony export */   parseAttributes: () => (/* binding */ parseAttributes)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__);
/**
 * commentsUtils.js
 *
 * Copyright (c) ww.itthinx.com
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
  const results = [];
  for (const block of blocks) {
    try {
      const result = await processCommentBlock(block);
      results.push({
        block,
        ...result
      });
    } catch (error) {
      block.innerHTML = `<p>${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Error loading comments', 'decent-comments')}</p>`;
    }
  }
  return results;
}
async function processCommentBlock(block) {
  try {
    const attributes = parseAttributes(block.dataset.attributes);
    if (attributes.post_id === '[current]' || attributes.post_id === '{current}') {
      if (window.current_post_id) {
        attributes.post_id = window.current_post_id;
      }
    }
    if (attributes.terms === '[current]' || attributes.terms === '{current}') {
      if (window.current_term_id) {
        attributes.term_ids = window.current_term_id;
      }
    }
    const response = await fetchComments(attributes, block.dataset.nonce || window.decentCommentsNonce);
    return {
      comments: response.comments || [],
      attributes
    };
  } catch (error) {
    console.error('Decent Comments Error:', error);
    throw error;
  }
}
function parseAttributes(data) {
  return JSON.parse(data || '{}');
}
async function fetchComments(attributes, nonce) {
  const query = buildQuery(attributes);
  try {
    const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `decent-comments/v1/comments?${query.toString()}`,
      method: 'GET',
      headers: {
        'X-WP-Nonce': nonce,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch comments:', error);
  }
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
    }),
    ...(attributes.avatar_size && {
      avatar_size: attributes.avatar_size
    })
  };
  return new URLSearchParams(params);
}
const RenderComments = ({
  comments,
  attributes
}) => {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
    className: "decent-comments",
    children: [attributes.title?.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
      className: "decent-comments-heading gamma widget-title",
      children: attributes.title
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("ul", {
      className: "decent-comments-list",
      children: comments.length === 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("li", {
        className: "comment no-comment",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('No comments', 'decent-comments')
      }) : comments.filter(comment => !attributes.exclude_post_author || comment.author_email !== comment.post_author).map(comment => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(RenderComment, {
        comment: comment,
        attributes: attributes
      }, comment.id))
    })]
  });
};
const RenderComment = ({
  comment,
  attributes
}) => {
  const author = attributes.show_author ? attributes.link_authors && comment.author_url ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("a", {
    href: safeEncodedUrl(comment.author_url),
    className: "comment-author-link",
    children: comment.author
  }) : comment.author : null;
  const date = attributes.show_date ? `${comment.date} ${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('at', 'decent-comments')} ${comment.time}` : null;
  const avatarSize = attributes.avatar_size || 48;
  const avatarStyle = {
    width: `${avatarSize}px`,
    height: `${avatarSize}px`,
    flexShrink: 0
  };
  let pre_avatar = '';
  let post_avatar = '';
  if (comment.author_url) {
    pre_avatar = '<a href="' + comment.author_url + '" rel="external">';
    post_avatar = '</a>';
  }
  const avatar = attributes.show_avatar && comment.avatar ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
    className: "comment-avatar",
    style: avatarStyle,
    dangerouslySetInnerHTML: {
      __html: pre_avatar + comment.avatar + post_avatar
    }
  }) : null;
  const excerpt = attributes.show_comment ? formatExcerpt(comment.content, attributes) : '';
  const link = attributes.show_link && comment.comment_link ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
    className: "comment-link",
    children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('on', 'decent-comments'), ' ', /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("a", {
      href: safeEncodedUrl(comment.comment_link),
      className: "comment-post-title",
      children: decodeEntities(comment.post_title)
    })]
  }) : null;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("li", {
    className: "comment-entry",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
      className: "comment-content",
      children: [avatar, author && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
        className: "comment-author",
        children: [decodeEntities(author), ' ']
      }), date && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxs)("div", {
        className: "comment-date",
        children: [date, ' ']
      }), link, ' ', excerpt && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("div", {
        className: "comment-excerpt",
        children: excerpt
      })]
    })
  }, comment.id);
};
function formatExcerpt(string, attributes) {
  if (!attributes.show_excerpt || !string) return '';
  let excerpt = string;
  if (attributes.strip_tags) {
    excerpt = decodeEntities(string);
  }
  if (attributes.max_excerpt_words > 0) {
    const words = excerpt.split(/\s+/).filter(word => word.length > 0);
    excerpt = words.slice(0, attributes.max_excerpt_words).join(' ') + (words.length > attributes.max_excerpt_words ? attributes.ellipsis || '…' : '');
  }
  if (attributes.max_excerpt_characters > 0) {
    excerpt = excerpt.substring(0, attributes.max_excerpt_characters) + (excerpt.length > attributes.max_excerpt_characters ? attributes.ellipsis || '…' : '');
  }
  return excerpt;
}
function decodeEntities(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/&#8211;/g, '–') // En-dash
  .replace(/&#8212;/g, '—') // Em-dash
  .replace(/&#8217;/g, '’') // Right single quotation mark (apostrophe)
  .replace(/&#8220;/g, '“') // Left double quotation mark
  .replace(/&#8221;/g, '”') // Right double quotation mark
  .replace(/&#8230;/g, '…').replace(/&raquo;/g, '»').replace(/&laquo;/g, '«').replace(/&#91;/g, '[').replace(/&#93;/g, ']').replace(/&amp;/g, '&') // Ampersand
  .replace(/&lt;/g, '<') // Less than
  .replace(/&gt;/g, '>'); // Greater than
}
function handleError(block, error) {
  block.innerHTML = `<p>${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Error loading comments', 'decent-comments')}</p>`;
  console.error('Decent Comments Error:', error);
}
function safeEncodedUrl(url) {
  try {
    const parsed = new URL(url);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return encodeURI(url);
    }
    return '#';
  } catch {
    return '#';
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RenderComments);

/***/ },

/***/ "./src/editor.css"
/*!************************!*\
  !*** ./src/editor.css ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ },

/***/ "@wordpress/api-fetch"
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ "@wordpress/blocks"
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["blocks"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "./src/block.json"
/*!************************!*\
  !*** ./src/block.json ***!
  \************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"apiVersion":3,"name":"decent-comments-block/decent-comments","title":"Decent Comments","category":"widgets","icon":"admin-comments","description":"Displays comments using versatile customizable options.","keywords":["comments","decent comments","widget"],"supports":{"html":false},"attributes":{"title":{"type":"string","default":""},"number":{"type":"number","default":5},"offset":{"type":"number","default":0},"post_id":{"type":"string","default":""},"post__in":{"type":"string","default":""},"post__not_in":{"type":"string","default":""},"post_tag":{"type":"string","default":""},"exclude_post_author":{"type":"boolean","default":false},"show_author":{"type":"boolean","default":true},"show_date":{"type":"boolean","default":true},"link_authors":{"type":"boolean","default":true},"show_avatar":{"type":"boolean","default":true},"avatar_size":{"type":"number","default":48},"show_link":{"type":"boolean","default":true},"show_excerpt":{"type":"boolean","default":true},"max_excerpt_words":{"type":"number","default":20},"max_excerpt_characters":{"type":"number","default":0},"ellipsis":{"type":"string","default":""},"strip_tags":{"type":"boolean","default":true},"order":{"type":"string","default":"desc"},"orderby":{"type":"string","default":"date_gmt"},"show_post_title":{"type":"boolean","default":false},"class":{"type":"string","default":""},"post_type":{"type":"string","default":"post"}},"textdomain":"decent-comments","editorScript":"file:./index.js","editorStyle":"file:./editor.css","style":"file:./styles.css","viewScript":"file:./view.js","script":"file:./commentsUtils.js"}');

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		const getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _editor_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./editor.css */ "./src/editor.css");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./block.json */ "./src/block.json");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _commentsUtils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./commentsUtils.js */ "./src/commentsUtils.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__);
/**
 * index.js
 *
 * Copyright (c) www.itthinx.com
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










(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_5__.name, {
  apiVersion: 3,
  title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Decent Comments', 'decent-comments'),
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
    const [comments, setComments] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)([]);
    const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useState)(null);
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_6__.useEffect)(() => {
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
          const response = await (0,_commentsUtils_js__WEBPACK_IMPORTED_MODULE_7__.fetchComments)(updatedAttributes, nonce);
          setComments(response.comments || []);
          setError(null);
        } catch (err) {
          setError(err);
          setComments([]);
        }
      };
      getComments();
    }, [attributes]);
    const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)({
      className: 'wp-block-itthinx-decent-comments',
      'data-attributes': JSON.stringify(attributes)
    });
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Comment Settings', 'decent-comments'),
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title', 'decent-comments'),
            value: attributes.title,
            onChange: value => setAttributes({
              title: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Number of Comments', 'decent-comments'),
            value: attributes.number,
            onChange: value => setAttributes({
              number: parseInt(value) || 5
            }),
            min: "1",
            type: "number"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Order by...', 'decent-comments'),
            value: attributes.orderby,
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Author Email', 'decent-comments'),
              value: 'comment_author_email'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Author URL', 'decent-comments'),
              value: 'comment_author_url'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Content', 'decent-comments'),
              value: 'comment_content'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Comment Date', 'decent-comments'),
              value: 'comment_date_gmt'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Karma', 'decent-comments'),
              value: 'comment_karma'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Post', 'decent-comments'),
              value: 'comment_post_id'
            }],
            onChange: value => setAttributes({
              orderby: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Sort order', 'decent-comments'),
            value: attributes.order,
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Descending', 'decent-comments'),
              value: 'desc'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Ascending', 'decent-comments'),
              value: 'asc'
            }],
            onChange: value => setAttributes({
              order: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Post ID', 'decent-comments'),
            value: attributes.post_id,
            onChange: value => setAttributes({
              post_id: value || ''
            }),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Title, empty, post ID or [current]', 'decent-comments')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Post type', 'decent-comments'),
            value: attributes.post_type,
            onChange: value => setAttributes({
              post_type: value
            }),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Available post types: ' + decentCommentsEdit.post_types, 'decent-comments')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Exclude comments from post authors', 'decent-comments'),
            checked: attributes.exclude_post_author,
            onChange: value => setAttributes({
              exclude_post_author: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Show comment excerpt', 'decent-comments'),
            checked: attributes.show_excerpt,
            onChange: value => setAttributes({
              show_excerpt: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Number of words in excerpts', 'decent-comments'),
            value: attributes.max_excerpt_words,
            onChange: value => setAttributes({
              max_excerpt_words: parseInt(value) || 20
            }),
            min: "0",
            type: "number"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Number of characters in excerpts', 'decent-comments'),
            value: attributes.max_excerpt_characters,
            onChange: value => setAttributes({
              max_excerpt_characters: parseInt(value) || 0
            }),
            min: "0",
            type: "number"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Ellipsis'),
            value: attributes.ellipsis,
            onChange: value => setAttributes({
              ellipsis: value
            }),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('The ellipsis is shown after the excerpt when there is more content.', 'decent-comments')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Show author', 'decent-comments'),
            checked: attributes.show_author,
            onChange: value => setAttributes({
              show_author: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Show date', 'decent-comments'),
            checked: attributes.show_date,
            onChange: value => setAttributes({
              show_date: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Link authors', 'decent-comments'),
            checked: attributes.link_authors,
            onChange: value => setAttributes({
              link_authors: value
            }),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Whether to link comment authors to their website.', 'decent-comments')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Show avatar', 'decent-comments'),
            checked: attributes.show_avatar,
            onChange: value => setAttributes({
              show_avatar: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Avatar size', 'decent-comments'),
            value: attributes.avatar_size,
            onChange: value => setAttributes({
              avatar_size: parseInt(value) || 48
            }),
            min: "0",
            type: "number"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Show link to post', 'decent-comments'),
            checked: attributes.show_link,
            onChange: value => setAttributes({
              show_link: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Show the comment', 'decent-comments'),
            checked: attributes.show_comment,
            onChange: value => setAttributes({
              show_comment: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Taxonomy', 'decent-comments'),
            value: attributes.taxonomy,
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('All post taxonomies', 'decent-comments'),
              value: ''
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('category', 'decent-comments'),
              value: 'category'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('tag', 'decent-comments'),
              value: 'post_tag'
            }],
            onChange: value => setAttributes({
              taxonomy: value
            }),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Select category if you would like to show comments on posts in certain categories. Give the desired categories\' slugs in Term. For tags select post_tag and give the tags\' slugs in Term.', 'decent-comments')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Term', 'decent-comments'),
            value: attributes.terms,
            onChange: value => setAttributes({
              terms: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Pingbacks', 'decent-comments'),
            checked: attributes.pingback,
            onChange: value => setAttributes({
              pingback: value
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.ToggleControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Trackbacks', 'decent-comments'),
            checked: attributes.trackback,
            onChange: value => setAttributes({
              trackback: value
            })
          })]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
        ...blockProps,
        children: error ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
          className: "decent-comments-error",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("p", {
            children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Error loading comments in editor', 'decent-comments'), error.message && `: ${error.message}`]
          })
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
          className: "wp-block-itthinx-decent-comments",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)(_commentsUtils_js__WEBPACK_IMPORTED_MODULE_7__.RenderComments, {
            comments: comments,
            attributes: attributes
          })
        })
      })]
    });
  },
  save: ({
    attributes
  }) => {
    const blockProps = _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps.save({
      className: 'wp-block-itthinx-decent-comments',
      'data-attributes': JSON.stringify(attributes)
    });
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsx)("div", {
      ...blockProps,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_8__.jsxs)("p", {
        children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Comments', 'decent-comments'), " \u2026"]
      })
    });
  }
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map