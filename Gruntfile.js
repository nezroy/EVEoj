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
			standalone: {
				src: ["./src/EVEoj.js"],
				dest: "./dist/<%= pkg.name %>.js",
				options: {
					bundleOptions: {
						debug: true,
						standalone: "<%= pkg.name %>"
					}
				}
			}
		},
		uglify: {
            all: {
                files: {
                    "./dist/<%= pkg.name %>.min.js": ["./libs/bluebird-2.2.2-core-progress.js", "./dist/<%= pkg.name %>.js"]
                }
            }
        },
		watchify: {
			options: {
				standalone: "<%= pkg.name %>",
				debug: true				
			},
			all: {
				src: "./src/EVEoj.js",
				dest: "./dist/<%= pkg.name %>.js"
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
		// "jasmine",
		"uglify"
	]);
};
