"use strict";

module.exports = function(grunt) {
	// configure grunt
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		jshint: {
			files: [
				"**/*.js",
				"!node_modules/**/*",
				"!libs/**/*",
				"!dist/**/*"
			],
			options: {
				jshintrc: ".jshintrc"
			}
		},
		jasmine_node: {
			specFolders: ["test/spec"]
		},
		browserify: {
			main: {
				src: ["./src/EVEoj.js"],
				dest: "./dist/<%= pkg.name %>.js",
				options: {
					bundleOptions: {
						debug: true,
						standalone: "<%= pkg.name %>"
					}
				}
			},
			test: {
				src: ["test/spec/*.spec.js"],
				dest: "dist/test_bundle.js",
				options: {
					bundleOptions: {
						debug: true,
						external: ["src/**/*.js"]
					}
				}
			}
		},
		uglify: {
			main: {
				files: {
					"./dist/<%= pkg.name %>.min.js": ["./libs/bluebird-2.2.2-core.js", "./dist/<%= pkg.name %>.js"]
				}
			}
		},
		watchify: {
			main: {
				options: {
					standalone: "<%= pkg.name %>",
					debug: true
				},
				src: "./src/EVEoj.js",
				dest: "./dist/<%= pkg.name %>.js"
			},
			test: {
				options: {
					external: ["src/**/*.js"],
					debug: true
				},
				src: "test/spec/**/*.js",
				dest: "dist/test_bundle.js"
			}
		},
		jasmine: {
			src: "dist/EVEoj.js",
			options: {
				specs: "dist/test_bundle.js",
				vendor: ["libs/jquery-1.11.1.js", "libs/bluebird-2.2.2-core.js"]
			}
		}
	});

	// Load plug-ins
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-jasmine");
	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jasmine-node");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-watchify");

	// define tasks
	grunt.registerTask("default", [
		"jshint",
		"jasmine_node",
		"browserify",
		"jasmine",
		"uglify"
	]);
};