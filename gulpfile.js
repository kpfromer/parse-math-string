const gulp = require('gulp');
const ts = require('gulp-typescript');
const nodemon = require('gulp-nodemon')

const tsProject = ts.createProject('tsconfig.json');

gulp.task('compile', () => {
  gulp.src('src/**/*')
		.pipe(tsProject())
		.pipe(gulp.dest('dist'));
})

gulp.task('watch', ['compile'], () => {
  nodemon({
    script: 'dist/main.js',
    watch: 'src/**/*',
    tasks: ['compile'] 
  })
})

gulp.task('default', ['watch'])