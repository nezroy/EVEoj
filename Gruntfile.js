module.exports = function(grunt) {
	// configure grunt
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		jshint: {
			options: {
				jshintrc: true
			},
			files: [
				"**/*.js",
				"!node_modules/**/*",
				"!libs/**/*",
				"!dist/**/*"
			]
		},
		jasmine_nodejs: {
            main: {
				specs: ["test/spec/**"]            
            }
		},
		browserify: {
			main: {
				src: ["src/EVEoj.js"],
				dest: "dist/<%= pkg.name %>.js",
				options: {
					browserifyOptions: {
						debug: true,
						standalone: "<%= pkg.name %>"
					}
				}
			}
		},
		uglify: {
			main: {
				files: {
					"./dist/<%= pkg.name %>.min.js": ["./libs/bluebird-3.4.0.js", "./dist/<%= pkg.name %>.js"]
				}
			}
		},
		jasmine: {
			src: "dist/EVEoj.js",
			options: {
				"--local-to-remote-url-access": true,
				specs: ["test/spec/*.js"],
				helpers: ["test/testprops.js"],
				vendor: ["libs/jquery-1.12.3.js", "libs/bluebird-3.4.0.js"]
			}
		}
	});

	// Load plug-ins
	grunt.loadNpmTasks("grunt-contrib-jasmine");
	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jasmine-nodejs");
	grunt.loadNpmTasks("grunt-contrib-uglify");

	// define tasks
	grunt.registerTask("default", [
		"jshint",
		"jasmine_nodejs",
		"browserify",
		"jasmine"
	]);
	grunt.registerTask("dist", [
		"jshint",
		"browserify",
		"uglify"
	]);
};
