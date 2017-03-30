var gulp = require('gulp');
var browserSync = require('browser-sync');

var bases = {
    app: 'App/',
    dist: 'dist/'
}

var tinylr;
gulp.task('livereload', ['lint'], function() {
    tinylr = require('tiny-lr')();
    tinylr.listen(3000);
});

gulp.task('serve', function() {
    browserSync.init({
        server: {
            startPath: '/',
            baseDir: bases.app
        }
    });
    gulp.watch(['**/*.html', 'App/**/*.css', 'App/js/*.js', 'App/component/**/*.js', 'App/component/**/*.html'], browserSync.reload);
});