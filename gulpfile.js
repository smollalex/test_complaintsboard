
'use strict';

const { src, dest, parallel, series, watch } = require('gulp');

// const pug = require('gulp-pug');
const twig = require('gulp-twig');
const sass = require('gulp-sass');
const prefix = require('gulp-autoprefixer');
const data = require('gulp-data');
//const minifyCSS = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const browsersync = require('browser-sync');
const gulpcopy = require('gulp-copy');
const fs = require('fs');
const del = require('del');
const path = require('path');

/*
 * Directories here
 */
var paths = {
    build: './build/',
    scss: './scss/',
    data: './data/',
    js: './js/',
    templates: './templates/'
};

// BrowserSync
function browserSync() {
  browsersync({
    server: {
      baseDir: paths.build
    },
    notify: false,
    browser: "google chrome",
    // proxy: "0.0.0.0:5000"
  });
}

// BrowserSync reload 
function browserReload () {
  return browsersync.reload;
}

// SCSS Main bundled into CSS task
function css() {
  return src(paths.scss + '/styles.scss')
    .pipe(sourcemaps.init())
    // Stay live and reload on error
    .pipe(plumber({
      handleError: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', function (err) {
      console.log(err.message);
      // sass.logError
      this.emit('end');
    }))
    .pipe(prefix(['last 15 versions','> 1%','ie 8','ie 7','iOS >= 9','Safari >= 9','Android >= 4.4','Opera >= 30'], {
      cascade: true
    }))
    //.pipe(minifyCSS())
    .pipe(concat('styles.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.build + 'assets/css'));
}

// SCSS Vendors bundled into CSS task
// function css_vendors() {
//   console.log(paths.scss);
//   return src(paths.scss + 'vendors/vendor.scss')
//     .pipe(sourcemaps.init())
//     // Stay live and reload on error
//     .pipe(plumber({
//       handleError: function (err) {
//         console.log(err);
//         this.emit('end');
//       }
//     }))
//     .pipe(sass({
//       includePaths: [paths.scss + 'vendors/'],
//       outputStyle: 'expanded'
//     }).on('error', function (err) {
//       console.log(err.message);
//       // sass.logError
//       this.emit('end');
//     }))
//     .pipe(prefix(['last 15 versions','> 1%','ie 8','ie 7','iOS >= 9','Safari >= 9','Android >= 4.4','Opera >= 30'], {
//       cascade: true
//     }))
//     //.pipe(minifyCSS())
//     .pipe(concat('bootstrap.min.css'))
//     .pipe(sourcemaps.write('.'))
//     .pipe(dest('build/assets/css'));
// }

// JS bundled into min.js task
function js() {
    return src(paths.js + '*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.build + 'assets/js'));
}

/**
 * Compile .twig files and pass in data from json file
 * matching file name. index.twig - index.twig.json
 */
function twigTpl () {
    return src([paths.templates + '*.twig'])
    // Stay live and reload on error
    .pipe(plumber({
      handleError: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    // Load template pages json data
    // .pipe(data(function (file) {
    //     return JSON.parse(fs.readFileSync(paths.data + path.basename(file.path) + '.json'));		
    //   }).on('error', function (err) {
    //     process.stderr.write(err.message + '\n');
    //     this.emit('end');
    //   })
    // )
    // Load default json data
    .pipe(data(function () {
          return JSON.parse(fs.readFileSync(paths.data + path.basename('index.twig.json')));
        }).on('error', function (err) {
          process.stderr.write(err.message + '\n');
          this.emit('end');
        })
    )
    // Twig compiled
    .pipe(twig()
        .on('error', function (err) {
          process.stderr.write(err.message + '\n');
          this.emit('end');
        })
    )    
    .pipe(dest(paths.build));
}

/**
 * Copy assets directory
 */
function copyAssets() {
  // Copy assets
  // Exclude // .psd, // .map
  return src(['./assets/**/*.*','!./assets/**/*.psd','!./assets/**/*.*.map'],
    del(paths.build + 'assets/**/*')
  )
  .pipe(gulpcopy(paths.build + 'assets', { prefix: 2 }));
}

// Watch files
function watchFiles() {
  // Watch SCSS changes    
  watch(paths.scss + '**/*.scss', parallel(css))
  .on('change', browserReload());
  
  // Watch javascripts changes
  watch(paths.js + '**/*.js', parallel(js))
  .on('change', browserReload());
  
  // Watch template changes
  watch([paths.templates + '**/*.twig', paths.data + '*.twig.json'], parallel(twigTpl))
  .on('change', browserReload());
  
  // Series on watch assets changes, copy and then reload browser
  watch('assets/**/*')
  .on('change', series(css, js, copyAssets, browserReload()));
}

const watching = parallel(watchFiles, browserSync);
const build = parallel(twigTpl, css, js, copyAssets);


exports.build = build;
exports.watch = watching;
