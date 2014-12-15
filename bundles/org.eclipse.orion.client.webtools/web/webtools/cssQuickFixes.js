 /*******************************************************************************
 * @license
 * Copyright (c) 2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env amd*/
/* global doctrine */
define([
'orion/objects'
], function(Objects) {
	
	/**
	 * @description Creates a new CSS quick fix computer
	 * @returns {webtools.CssQuickFixes} The new quick fix computer instance
	 * @since 8.0
	 */
	function CssQuickFixes() {
	}
	
	Objects.mixin(CssQuickFixes.prototype, /** @lends webtools.CssQuickFixes.prototype*/ {
		/**
		 * @description Editor command callback
		 * @function
		 * @param {orion.edit.EditorContext} editorContext The editor context
		 * @param {Object} context The context params
		 */
		execute: function(editorContext, context) {
		    var fixes = this[context.annotation.id];
	        if(fixes) {
	            return fixes(editorContext, context.annotation);
	        }
		    return null;
		},
		"zero-units": function(editorContext, annotation) { //$NON-NLS-0$
			return editorContext.getText().then(function(text) {
				var contents = text.substring(annotation.start, annotation.end);
				contents = contents.replace(/0px/g,'0'); //$NON-NLS-0$
				return editorContext.setText(contents, annotation.start, annotation.end);
            });
		},
		"empty-rules": function(editorContext, annotation) { //$NON-NLS-0$
			return editorContext.getText().then(function(text) {
				// Remove leading space
				var start = annotation.start;
				while (start >= 0 && (text[start-1] === ' ' || text[start-1] === '\t')){ //$NON-NLS-0$ //$NON-NLS-1$
					start--;
				}
				var contents = text.substring(annotation.start);
				contents = contents.match(/.*{\s*}\s*/,''); //$NON-NLS-0$
				if (contents){
					return editorContext.setText("", start, start+contents[0].length);
				}
				return null;
            });
		}
	});
	
	CssQuickFixes.prototype.contructor = CssQuickFixes;
	
	return {
		CssQuickFixes: CssQuickFixes
	};
});
