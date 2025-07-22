/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/react-dom/client.js":
/*!******************************************!*\
  !*** ./node_modules/react-dom/client.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var m = __webpack_require__(/*! react-dom */ "react-dom");
if (false) // removed by dead control flow
{} else {
  var i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  exports.createRoot = function(c, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.createRoot(c, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
  exports.hydrateRoot = function(c, h, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.hydrateRoot(c, h, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
}


/***/ }),

/***/ "./src/commentsUtils.js":
/*!******************************!*\
  !*** ./src/commentsUtils.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderComment: () => (/* binding */ RenderComment),
/* harmony export */   RenderComments: () => (/* binding */ RenderComments),
/* harmony export */   buildQuery: () => (/* binding */ buildQuery),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   fetchComments: () => (/* binding */ fetchComments),
/* harmony export */   formatExcerpt: () => (/* binding */ formatExcerpt),
/* harmony export */   handleError: () => (/* binding */ handleError),
/* harmony export */   initializeComments: () => (/* binding */ initializeComments),
/* harmony export */   parseAttributes: () => (/* binding */ parseAttributes),
/* harmony export */   processCommentBlock: () => (/* binding */ processCommentBlock),
/* harmony export */   sanitizeHTML: () => (/* binding */ sanitizeHTML)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);

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

//import React from 'react';


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
      block.innerHTML = `<p>${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Error loading comments', 'decent-comments')}</p>`;
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
  const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
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
const RenderComments = ({
  comments,
  attributes
}) => {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "decent-comments"
  }, attributes.title?.length > 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "decent-comments-heading gamma widget-title"
  }, sanitizeHTML(attributes.title)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
    className: "decent-comments list-none"
  }, comments.length === 0 ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No Comments', 'decent-comments')) : comments.filter(comment => !attributes.exclude_post_author || comment.author_email !== comment.post_author).map(comment => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(RenderComment, {
    key: comment.id,
    comment: comment,
    attributes: attributes
  }))));
};
const RenderComment = ({
  comment,
  attributes
}) => {
  const author = attributes.show_author ? attributes.link_authors && comment.author_url ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: sanitizeHTML(comment.author_url),
    className: "comment-author-link"
  }, sanitizeHTML(comment.author)) : sanitizeHTML(comment.author) : null;
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour12: true
  };
  const date = attributes.show_date ? `${new Date(comment.date).toLocaleDateString(undefined, dateOptions)} ${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('at', 'decent-comments')} ${new Date(comment.date).toLocaleTimeString()}` : null;
  const avatar = attributes.show_avatar && comment.avatar ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
    src: sanitizeHTML(comment.avatar),
    alt: sanitizeHTML(comment.author || ''),
    width: attributes.avatar_size || 48,
    height: attributes.avatar_size || 48,
    className: "rounded-full"
  }) : null;
  const excerpt = attributes.show_comment ? formatExcerpt(comment.content, attributes) : '';
  const postTitle = attributes.show_link && comment.comment_link ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", null, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('on', 'decent-comments'), ' ', (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: sanitizeHTML(comment.comment_link || '#'),
    className: "comment-post-title"
  }, sanitizeHTML(comment.post_title || ''))) : null;
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    key: comment.id,
    className: "comment"
  }, avatar, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "comment-content"
  }, author && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "comment-author"
  }, author, ' '), date && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "comment-date"
  }, date, ' '), postTitle, ' ', excerpt && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "comment-excerpt"
  }, excerpt)));
};
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
  block.innerHTML = `<p>${(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Error loading comments', 'decent-comments')}</p>`;
  console.error('Decent Comments Error:', error);
}
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RenderComments);

/***/ }),

/***/ "@wordpress/api-fetch":
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["apiFetch"];

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

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ ((module) => {

module.exports = window["ReactDOM"];

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
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom/client */ "./node_modules/react-dom/client.js");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _commentsUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./commentsUtils.js */ "./src/commentsUtils.js");

/**
 * view.js
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
    try {
      const attributes = (0,_commentsUtils_js__WEBPACK_IMPORTED_MODULE_3__.parseAttributes)(block.dataset.attributes);
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
      const response = await (0,_commentsUtils_js__WEBPACK_IMPORTED_MODULE_3__.fetchComments)(attributes, nonce);
      const root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_1__.createRoot)(block);
      root.render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_commentsUtils_js__WEBPACK_IMPORTED_MODULE_3__.RenderComments, {
        comments: response.comments || [],
        attributes: attributes
      }));
    } catch (error) {
      const root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_1__.createRoot)(block);
      root.render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
        className: "text-red-500"
      }, (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Error loading comments', 'decent-comments')));
      console.error('Decent Comments Error:', error);
    }
  }
});
})();

/******/ })()
;
//# sourceMappingURL=view.js.map