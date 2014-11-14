/*******************************************************************************
 * Copyright (c) 2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env node*/
var fmt = require("util").format;

function sanitizeClassName(s) {
	return s.replace(/[^A-Za-z0-9_\.]/g, "_");
}

function sanitizeXmlAttr(s) {
	return s.replace(/['"&]/g, "_");
}

/**
 * For Hudson to parse out nice packages instead of (root), we have to add classname="packageName.className"
 * to the <testsuite> element, and prefix the "packageName." onto every <testcase>'s @classname. We also strip
 * out some problematic characters from the original classnames: [#?.]
 * @param {String} xml The xunit test result
 * @returns {String} The test result, fixed up
 */
exports.xunit_cleanup = function(xml, sauceResult, testUrl) {
	testUrl = testUrl.replace(/(^\/)|(\.html$)/g, "");
	var platform = sanitizeClassName(sauceResult.platform.join(" ")),
	    packageName = sanitizeClassName(fmt("%s.%s", platform, testUrl));
	return xml
		.replace(/(<testsuite\s+name="[^"]+")/g, fmt("$1 classname=\"%s\"", packageName))
		.replace(/<testcase classname="([^"]+)"/g, function(match, className) {
			return fmt("<testcase classname=\"%s.%s\"", packageName, className.replace(/[#?.]/g, "_"));
		});
};

/**
 * Returns a barebones xunit test suite mentioning the test url and error. This is useful for giving *something*
 * to the Hudson build that indicates a failure. Otherwise unexpected errors might not be shown at all in the build.
 * @returns {String} An xunit 
 */
exports.xunit_suite_error = function(testurl, error) {
	var classname = sanitizeClassName(testurl),
	    errorMessage = sanitizeXmlAttr(error.message);
	var xml = ''
		+ fmt('<testsuite name="%s" classname="%s" tests="1" failures="0" errors="1" skipped="0" timestamp="%s" time="0">', testurl, classname, (new Date()).toUTCString())
			+ fmt('<testcase classname="SuiteFailure" name="SuiteFailure" time="0" message="%s">', errorMessage)
				+ fmt('<failure classname="SuiteFailure" name="SuiteFailure" time="0" message="%s">', errorMessage)
					+ '<![CDATA['
					+ error.stack
					+ ']]>'
				+ '</failure>'
			+ '</testcase>'
		+ '</testsuite>';
	return xml;
};

exports.xunit_write = function(grunt, filepath, contents) {
	grunt.verbose.write(fmt("Writing result file %s", filepath));
	grunt.file.write(filepath, contents);
	grunt.verbose.ok();
};

