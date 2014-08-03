'use strict';
 
module.exports = function(grunt) {
	// configure grunt
	grunt.initConfig({ 
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: [
				'**/*.js',
				'!node_modules/**/*',
				'!dist/**/*'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		jasmine_node: {
            specFolders: ['test/spec']//,
            // forceExit: true,
        },		
		browserify: {
			standalone: {
				src: [ './src/core.js' ],
				dest: './dist/<%= pkg.name %>.js',
				options: {
					bundleOptions: {
						standalone: '<%= pkg.name %>'
					}
				}
			},
		},
		uglify: {
            all: {
                files: {
                    './dist/<%= pkg.name %>.min.js': ['./dist/<%= pkg.name %>.js']
                }
            }
        }		
	});
 
	// Load plug-ins
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jasmine-node');
	grunt.loadNpmTasks('grunt-contrib-uglify');
 
	// define tasks
	grunt.registerTask('default', [
		//'jshint',
		'jasmine_node',
		'browserify',
		// 'jasmine',
		'uglify'
	]);
};
