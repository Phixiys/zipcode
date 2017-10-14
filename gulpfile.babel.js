'use strict';

import gulp from 'gulp';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import uglifyify from 'uglifyify';
import babelify from 'babelify';
import notify from 'gulp-notify';
import twig from 'gulp-twig';
import prefix from 'gulp-autoprefixer';
import watch from 'gulp-watch';
import rename from 'gulp-rename';
import imagemin from 'imagemin';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import gutil from 'gulp-util';
import browserSync from 'browser-sync';
import fs from 'fs';
import path from 'path';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import url from 'url';

const config = {
  sassPath: './src/sass',
  twigPath: './src/templates',
  assetsPath: './src/assets',
  scriptPath: './src/scripts'
}

function standardHandler(err){
  gutil.log(gutil.colors.red('Error'), err.message);
}
function browserifyHandler(err){
 standardHandler(err);
 this.emit('end');
}

/* SaSS task */
gulp.task('css', () =>  {
  gulp.src(config.sassPath + '/style.scss')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(cleanCSS())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(prefix(["last 2 version"]))
    .pipe(gulp.dest('./public/css'));
});

/* Image task */
gulp.task('imagemin', () =>  {
  return gulp.src(config.assetsPath + '/img/**/*.*')
    .pipe(imagemin())
    .pipe(gulp.dest('./public/assets/img'));
});

/* JS Task */
gulp.task('scripts', () => {
  return gulp.src(config.scriptPath + '/**/*.*')
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./public/scripts'));
});

gulp.task('browserify', () =>  {
  browserify({
      entries: ['./src/scripts/app.js']
    })
    .transform("babelify", {presets: ["env"]})
    .transform(uglifyify, {global: true})
    .bundle()
    .on('error', browserifyHandler)
    .pipe(source('app.js'))
    .pipe(gulp.dest('./public/scripts/')
  );
});

/* twig task */
gulp.task('templates', () =>  {
  return gulp.src([config.twigPath + '/**/*.twig', '!./src/templates/layout.twig']) // Exclude layout.twig from build
        .pipe(twig({
          defaults: {
            cache: false,
          }
        })
        .on('error', (e) => {
          console.log(e);
        }))
        .pipe(gulp.dest('./public'));
});

// Browsersync
// The default file if the file/path is not found
const defaultFile = "index.twig"

const tmpFolder = path.resolve(__dirname, "./public/");
const srcFolder = path.resolve(__dirname, "./src/");

gulp.task('browserSync', () => {
  browserSync({
    server: {
      baseDir: ['public', 'src'],
      middleware: (req, res, next) => {
        let fileName = url.parse(req.url);
        fileName = fileName.href.split(fileName.search).join("");

        let tmpFileExists = fs.existsSync(tmpFolder + fileName),
            srcFileExists = fs.existsSync(srcFolder + fileName);

        if ((!tmpFileExists && !srcFileExists) && fileName.indexOf("browser-sync-client") < 0) {
          req.url = "/" + defaultFile;
        }
        return next();
      }
    },
    files: [
      // Watch everything in build
      "public/**/*",
      // Exclude sourcemap files
      "!public/**.map"
    ],
     ghostMode: {
        scroll: true,
        links: true,
        forms: true
      }
  });
});

// Rerun the task when a file changes or is added
gulp.task('watch', ['browserSync'], () => {
  watch(config.sassPath + '/**/*.scss', () => {
    gulp.start('css');
  });
  watch(config.twigPath + '/**/*.twig', () => {
    gulp.start('templates');
  });
  watch(config.scriptPath + '/**/*.js', () => {
    gulp.start('browserify');
  });
});

gulp.task('default', ['css', 'templates', 'scripts', 'watch', 'browserify']);
gulp.task('build', ['css', 'templates', 'imagemin', 'browserify']);
