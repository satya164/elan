/**
 * @fileOverview - Simple library to manage CSS stylesheets.
 * @author - Satyajit Sahoo <satyajit.happy@gmail.com>
 */

(function() {
    "use strict";

    /**
     * Construct a Elan object
     * @constructor
     * @param {String} attr
     * @param {String} value
     * @example new Elan("media", "screen")
     */
    function Elan(attr, value) {
        var style;

        // Handle situation where called without "new" keyword
        if (false === (this instanceof Elan)) {
            return new Elan(attr, value);
        }

        style = document.createElement("style"); // Create a style element

        style.appendChild(document.createTextNode("")); // Fix webKit not recognizing stylesheet

        if (typeof attr === "string" && value) {
            style.setAttribute(attr, value);
        }

        if (typeof attr === "object") {
            for (var a in attr) {
                style.setAttribute(a, attr[a]);
            }
        }

        document.head.appendChild(style);

        this.HTMLStyleElement = style;
        this.sheet = style.sheet;
    }

    Elan.prototype = {
        /**
         * Provide a cross-browser way to add CSS rules
         * @param {String} selector
         * @param {String} rules
         * @param {Number} [index]
         * @returns {Object} this
         * @example addRule(".header", "position: fixed; top: 0; left: 0", 1)
         */
        addRule: function(selector, rules, index) {
            index = (typeof index === "number" && !isNaN(index)) ? index : this.sheet.cssRules.length;

            if (this.sheet.insertRule) {
                this.sheet.insertRule(selector + " {" + rules+ "}", index);
            } else if (this.sheet.addRule) {
                this.sheet.addRule(selector, rules, index);
            } else {
                this.HTMLStyleElement.appendChild(document.createTextNode(selector + "{" + rules+ "}"));
            }

            return this;
        },

        /**
         * Remove a CSS rule from the stylesheet
         * @param {Number} index
         * @returns {Object} this
         * @example removeRule(1)
         */
        removeRule: function(index) {
            if ("removeRule" in this.sheet) {
                this.sheet.removeRule(index);
            } else if ("deleteRule") {
                this.sheet.deleteRule(index);
            }

            return this;
        },

        /**
         * Clear all CSS rules from the stylesheet
         * @returns {Object} this
         * @example clearRules()
         */
        clearRules: function() {
            // Loop in reverse and remove rules one by one
            // Otherwise we will get error as the length keeps changing
            for (var i = this.sheet.cssRules.length - 1; i >= 0; i--) {
                this.removeRule(i);
            }

            return this;
        },

        /**
         * Add CSS to the Sheet
         * @param {Object.<selector, styles>} css
         * @param {Number} [index]
         * @returns {Object} this
         * @example addCSS({ ".header": { position: "fixed" } }, 1)
         */
        addCSS: function(css, index) {
            var block, proplist,
                rules = "";

            if (typeof css !== "object") {
                throw new Error("Invalid CSS object " + css);
            }

            for (var selector in css) {
                block = css[selector];

                if (typeof block !== "object") {
                    throw new Error("Invalid style block " + selector + ":" + block);
                }

                for (var prop in block) {
                    proplist = block[prop];

                    // Convert camelcase properties to proper properties, e.g.- backgroundSize = background-size
                    prop = prop.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

                    // If an array is passed as value, separate it into different properties
                    // Useful for vendor-prefixing etc.
                    if (typeof proplist === "string") {
                        rules += prop + ":" + proplist + ";";
                    } else if (proplist instanceof Array) {
                        for (var i = 0, l = proplist.length; i < l; i++) {
                            rules += prop + ":" + proplist[i] + ";";
                        }
                    }
                }

                this.addRule(selector, rules, index);
            }

            return this;
        },

        /**
         * Remove rules for a specific selector
         * @param {String} selector
         * @param {Number} [index]
         * @returns {Object} this
         * @example removeCSS(".header")
         */
        removeCSS: function(selector, index) {
            var rules = this.sheet.rules || this.sheet.cssRules;

            if (typeof index === "number" && !isNaN(index)) {
                if (rules[index].selectorText === selector) {
                    this.removeRule(index);
                }
            } else {
                for (var i = 0, l = rules.length; i < l; i++) {
                    if (rules[i].selectorText === selector) {
                        this.removeRule(i);
                    }
                }
            }

            return this;
        },

        /**
         * Print the stylesheet as text string
         * @return {String} text
         * @example toString()
         */
        toString: function() {
            var rules = this.sheet.rules || this.sheet.cssRules,
                text = "";

            for (var i = 0, l = rules.length; i < l; i++) {
                text += rules[i].cssText + "\n";
            }

            return text.trim();
        }
    };

    if (typeof define === "function" && define.amd) {
        // Define as AMD module
        define(function() {
            return Elan;
        });
    } else if (typeof module !== "undefined" && module.exports) {
        // Export to CommonJS
        module.exports = Elan;
    } else {
        window.Elan = Elan;
    }
}());
