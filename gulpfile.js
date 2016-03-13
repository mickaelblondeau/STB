var config = require('./config.json');
var gulp = require('gulp');
var ts = require('gulp-typescript');
var header = require('gulp-header');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
 
gulp.task('default', ['build'], function() {
	return gulp.src('build/STB3.user.js').pipe(gulp.dest(config.dest));
});

gulp.task('watch', function() {
	watch('src/**/*.ts', batch(function(events, done) {
		gulp.start('default', done);
	}));
});

gulp.task('build', function() {
	return gulp.src('src/**/*.ts')
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
		.pipe(gulp.dest('build'));
});