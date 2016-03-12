var gulp = require('gulp');
var ts = require('gulp-typescript');
var header = require('gulp-header');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
 
gulp.task('default', function() {
	gulp.src('src/**/*.ts')
		.pipe(ts({
			noImplicitAny: true,
			removeComments: true,
			out: 'STB3.user.js'
		}))
		.pipe(header([
			'// ==UserScript==',
			'// @name        STB3',
			'// @namespace   STB3',
			'// @include     http://strategus.c-rpg.net/*',
			'// @version     3.0.0',
			'// @grant       none',
			'// ==/UserScript==',
			''
		].join('\n')))
		.pipe(gulp.dest('../'));
	return gulp.src('../STB3.user.js')
		.pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
	watch('src/**/*.ts', batch(function(events, done) {
		gulp.start('default', done);
	}));
});