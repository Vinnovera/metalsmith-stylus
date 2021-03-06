var stylus = require('stylus');
var minimatch = require('minimatch');
var join = require('path').join;

function plugin (opts) {
  opts = opts || {};
  opts.set = opts.set || {};
  opts.set.paths = (opts.set.paths || []).map(absPath);
  opts.use = opts.use || [];
  opts.define = opts.define || {};
  opts.include = opts.include || [];
  opts.import = opts.import || [];

  return function (files, metalsmith, done) {
    var destination = metalsmith.destination();
    var source = metalsmith.source();
    var styles = Object.keys(files).filter(minimatch.filter("*.+(styl|stylus)", {matchBase: true}));

    var paths = styles.map(function (path) {
      var ret = path.split('/');
      ret.pop();
      return source + '/' + ret.join('/');
    });

    opts.set.paths = paths.concat(opts.set.paths);

    styles.forEach(function (file, index, arr) {
      var out = file.split('.');
      out.pop();
      out = out.join('.') + '.css';
      var s = stylus(files[file].contents.toString())
        .set('filename', file);
        
        for (var key in opts.set) {
          s.set(key, opts.set[key]);
        }

        for (var key in opts.use) {
          s.use(opts.use[key]);
        }

        for (var key in opts.define) {
          s.define(key, opts.define[key]);
        }

        for (var key in opts.include) {
          s.include(opts.include[key]);
        }

        for (var key in opts.import) {
          s.import(opts.import[key]);
        }

        s.render(function (err, css) {
          if (err) throw err;
          delete files[file];
          files[out] = { contents: new Buffer(css) };
        });
    });
    done();
  };
}

module.exports = plugin;

function absPath(relative) {
  return join(process.cwd(), relative);
}
