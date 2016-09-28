var gulp        = require('gulp'),
jshint          = require('gulp-jshint'),
stylus          = require('gulp-stylus'),
jade            = require('gulp-jade'),
concat          = require('gulp-concat'),
uglify          = require('gulp-uglify'),
rename          = require('gulp-rename'),
connect         = require('gulp-connect'),
del             = require('del'),
vinylPaths      = require('vinyl-paths'),
merge           = require('merge-stream'),
sourcemaps      = require('gulp-sourcemaps'),
livereload      = require('gulp-livereload'),
fs              = require('fs'),
gulpif          = require('gulp-if'),
minimist        = require('minimist'),
gulpUtil        = require('gulp-util'),
cleanCSS        = require('gulp-clean-css');
cache           = require('gulp-cached');

var knownOptions = {
  string: 'env',
  default: { env: 'development' }
};

var options = minimist(process.argv.slice(2), knownOptions);

var thirdPartyLibs = [
    'dev/js/vendor/jquery-1.12.4.min.js',
    'dev/js/vendor/jquery.easings.js',
    'dev/js/vendor/velocity.min.js'
];

var thirdPartyStylesheets = [
    'dev/styl/vendor/normalize.css',
    'dev/styl/vendor/grids-responsive.min.css'
];

//lint JS
gulp.task('lint', function() {
    return gulp.src('dev/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile stylus to css
gulp.task('stylus', ['clean-css'], function() {

    return gulp.src('dev/styl/main.styl')
        // .pipe(gulpif(options.env == 'development', sourcemaps.init()))
        .pipe(stylus())
        // .pipe(gulpif(options.env == 'development', sourcemaps.write()))
        .pipe(gulp.dest('www/css'));

});

// Concat css after stylus
gulp.task('concat-css', ['stylus'], function() {

    if (options.env == 'production') {

        return gulp.src(thirdPartyStylesheets.concat(['www/css/main.css']))
            .pipe(concat('styles.css'))
            .pipe(gulpif(options.env == 'production', cleanCSS({compatibility: 'ie8'})))
            .pipe(gulp.dest('www/css'))

    } else {

        return gulp.src(thirdPartyStylesheets.concat(['www/css/main.css']))
            .pipe(gulp.dest('www/css'));

    }

});

//compile jade to html
gulp.task('jade', ['scripts', 'stylus'], function() {

    return gulp.src(['dev/jade/*.jade', '!dev/jade/_*.jade'])
        .pipe(cache('jade'))
        .pipe(jade({
            locals: {
                js: thirdPartyLibs,
                css: thirdPartyStylesheets,
                env: options.env
            },
            pretty: true
        }))
        .pipe(gulp.dest('www'))
        .pipe(livereload());

});

// Concatenate & Minify JS
gulp.task('scripts', ['clean-js', 'concat-css'], function() {

    if (options.env == 'production') {

        return gulp.src(thirdPartyLibs.concat(['dev/js/main.js']))
            // .pipe(sourcemaps.init())
            .pipe(concat('app.min.js'))
            // .pipe(sourcemaps.write())
            .pipe(uglify().on('error', gulpUtil.log))
            .pipe(gulp.dest('www/js'))

    } else {

        var vendor =  gulp.src(thirdPartyLibs)
            .pipe(gulp.dest('www/js/vendor'));

        var main = gulp.src([
            'dev/js/main.js'
            ])
            .pipe(gulp.dest('www/js'));

        return merge(vendor, main);

    }

});

//copy statics && external css
gulp.task('statics', ['concat-css'], function() {
    var media = gulp.src('dev/media/**/*.*')
        .pipe(gulp.dest('www/media'));

    var css = gulp.src('dev/css/**/*.*')
        .pipe(gulp.dest('www/css'));

    var fonts = gulp.src('dev/fonts/**/*.*')
        .pipe(gulp.dest('www/fonts'));

    return merge(media, css, fonts);

});

gulp.task('clean', ['concat-css'], function () {
    return gulp.src('www/css/main.css')
        .pipe(gulpif(options.env == 'production', vinylPaths(del)))
});

gulp.task('clean-css', function(){
    return gulp.src('www/css/**/*.*')
        .pipe(vinylPaths(del))
});

gulp.task('clean-js', function(){
    return gulp.src('www/js/**/*.*')
        .pipe(vinylPaths(del))
});


// Watch Files For Changes
gulp.task('watch', function() {

    if (options.env == 'development') {
        livereload.listen();
        gulp.watch('dev/js/*.js', ['jade', 'clean']);
        gulp.watch('dev/styl/**/*.*', ['jade', 'clean']);
        gulp.watch('dev/jade/**/*.jade', ['jade', 'clean']);
    }

});

//init http server
gulp.task('connect', function() {

    if (options.env == 'development') {
        connect.server({
            root: 'www',
            port: 2211
        });
    }

});

// Default Task
gulp.task('default', ['statics', 'jade', 'clean', 'watch', 'connect']);
