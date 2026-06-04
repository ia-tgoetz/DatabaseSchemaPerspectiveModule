/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("WARGoetzDesigner", [], factory);
	else if(typeof exports === 'object')
		exports["WARGoetzDesigner"] = factory();
	else
		root["WARGoetzDesigner"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./typescript/perspective-designer.ts":
/*!********************************************!*\
  !*** ./typescript/perspective-designer.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\n// You only define ComponentDesignDelegates here if you are building custom \r\n// bounding boxes, resize handles, or deep designer-only overlays. \r\n// For standard rendering, Ignition falls back to the Client component automatically!\r\n// Leave this file intentionally blank of component registrations.\r\n\n\n//# sourceURL=webpack://WARGoetzDesigner/./typescript/perspective-designer.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./typescript/perspective-designer.ts"](0, __webpack_exports__);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});