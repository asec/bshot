'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('bshot.jquery.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      files: ['dist', 'build']
    },
    includes: {
      files: {
        src: 'bshot.js',
        dest: 'build/',
        cwd: './src',
        options: {
          includeRegexp: /^\/\/\@\s*import\s+['"]?([^'"]+)['"]?\s*$/,
          duplicates: false
        }
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['build/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      },
    },
    lineremover: {
      main: {
        files: {
          "build/<%= pkg.name %>.js": "build/<%= pkg.name %>.js"
        },
        options: {
          exclusionPattern: /^\s*console\..*$/g
        }
      }
    },
    /*qunit: {
      files: ['test/***.html']
    },*/
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/**/*.js']
      },
      /*test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/***.js']
      },*/
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>'/*,
        tasks: ['jshint:src', 'qunit']*/
      },
      /*test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      },*/
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-line-remover');

  // Default task.
  grunt.registerTask('default', ['jshint'/*, 'qunit'*/, 'clean', 'includes', 'lineremover', 'concat', 'uglify']);
  // Debug task
  grunt.registerTask('debug', ['jshint'/*, 'qunit'*/, 'clean', 'includes', 'concat', 'uglify']);

};
