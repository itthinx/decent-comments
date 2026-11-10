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

/***/ "react-dom/client"
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
(module) {

module.exports = window["ReactDOM"];

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

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

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
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-dom/client */ "react-dom/client");
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_dom_client__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _commentsUtils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./commentsUtils.js */ "./src/commentsUtils.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);
/**
 * view.js
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





let current_post_id = null;
let current_term_id = null;
if (window.decentCommentsView) {
  if (window.decentCommentsView.current_post_id) {
    current_post_id = window.decentCommentsView.current_post_id;
  }
  if (window.decentCommentsView.current_term_id) {
    current_term_id = window.decentCommentsView.current_term_id;
  }
}
document.addEventListener('DOMContentLoaded', async () => {
  const blocks = document.querySelectorAll('.wp-block-itthinx-decent-comments');
  for (const block of blocks) {
    if (!block._decentCommentsRoot) {
      block._decentCommentsRoot = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_0__.createRoot)(block);
    }
    const root = block._decentCommentsRoot;
    try {
      const attributes = (0,_commentsUtils_js__WEBPACK_IMPORTED_MODULE_2__.parseAttributes)(block.dataset.attributes);
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
      const nonce = window.decentCommentsView?.nonce || '';
      const response = await (0,_commentsUtils_js__WEBPACK_IMPORTED_MODULE_2__.fetchComments)(attributes, nonce);
      root.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_commentsUtils_js__WEBPACK_IMPORTED_MODULE_2__.RenderComments, {
        comments: response.comments || [],
        attributes: attributes
      }));
    } catch (error) {
      root.render(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
        className: "text-red-500",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Error loading comments', 'decent-comments')
      }));
      console.error('Decent Comments Error:', error);
    }
  }
});
})();

/******/ })()
;
//# sourceMappingURL=view.js.map