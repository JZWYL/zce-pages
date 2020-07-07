const { src, dest, parallel, series, watch } = require('gulp')
const del = require('del')
const browserSync = require('browser-sync')
const loadPlugins = require('gulp-load-plugins')

const plugins = loadPlugins()
const bs = browserSync.create()
    // 当前工作目录
const cwd = process.cwd()
let config = {
    // default configyr
    build: {
        src: 'src',
        dist: 'dist',
        temp: 'temp',
        public: 'public',
        paths: {
            styles: 'assets/styles/*.scss',
            scripts: 'assets/scripts/*.js',
            pages: '*.html',
            images: 'assets/images/**',
            fonts: 'assets/fonts/**'
        }
    }
}
try {
    const loadConfig = require(`${cwd}/pages.config.js`)
    config = Object.assign({}, config, loadConfig)
} catch (e) {}
// const plugins.babel = require('gulp-babel')
// const plugins.sass = require('gulp-sass')
// const plugins.swig = require('gulp-swig')
// const plugins.imagemin = require('gulp-imagemin')
// 私有的任务，根据需要进行导出



// ---------------清除操作----------
const clean = () => {
    console.log(plugins)
    return del([config.build.dist, config.build.temp])
}

// -----------------样式的编译任务-----------------
const style = () => {
    return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.sass({ outputStyle: 'expanded' }))
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({ stream: true }))
}

// --------------------脚本文件编译任务------------------

const script = () => {
    return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({ stream: true }))
}

// ------------页面模板编译任务--------------------------

const page = () => {
    return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.swig({ data: config.data }))
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({ stream: true }))
}

// -----------------------图片转换-----------------------
const image = () => {
    return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.temp))
}


// -----------------------字体任务------------------------
const font = () => {
    return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.temp))
}

// 其他的
const extra = () => {
    return src('**', { base: config.build.public, cwd: config.build.public })
        .pipe(dest(config.build.dist))
}

// 
const server = () => {
    watch(config.build.paths.styles, { cwd: config.build.src }, style)
    watch(config.build.paths.scripts, { cwd: config.build.src }, script)
    watch(config.build.paths.pages, { cwd: config.build.src }, page)

    // watch('src/assets/images/**', image)
    // watch('src/assets/fonts/**', font)
    // watch('public/**', extra)
    watch([
        config.build.paths.images,
        config.build.paths.fonts,
    ], { cwd: config.build.src }, bs.reload)

    watch('**', { cwd: config.build.public }, bs.reload)

    bs.init({
        notify: false,
        // port: 2080,
        // open:false,
        // files: 'dist/**', //监听的路径
        server: {
            baseDir: [config.build.temp, config.build.src, config.build.public],
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
}

const useref = () => {
        return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
            .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
            .pipe(plugins.if(/\.js$/, plugins.uglify()))
            .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
            .pipe(plugins.if(/\.html$/, plugins.htmlmin({
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true
            })))
            .pipe(dest(config.build.dist))
    }
    // -------------------------组合任务----------------------
    // src下面需要编译的文件
const compile = parallel(style, script, page)
    // 

// 所有文件的构建
// 先清除目录下的文件，再构建

// 上线前执行的任务
const build = series(
    clean,
    parallel(
        series(compile, useref),
        image,
        font,
        extra
    )
)

const develop = series(compile, server)

module.exports = {
    clean,
    build,
    develop
}