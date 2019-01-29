import del from "del";
import gulp from "gulp";
import babel from "gulp-babel";
import eslint from "gulp-eslint";
import ext from "gulp-ext-replace";
import jscc from "gulp-jscc";

const eslintConfig = {
  "parser": "babel-eslint",
  "plugins": ["flowtype"],
  "rules": {
    "comma-dangle": [2, "always-multiline"],
    "semi": 2,
    "no-unexpected-multiline": 1,
    "no-underscore-dangle": 0,
    "space-infix-ops": 0,
    "no-multi-spaces": 0,
    "no-unused-vars": 1,
    "comma-spacing": 1,
    "no-use-before-define": 0,
    "eol-last": 0,
    "no-extra-semi": 0,
    "curly": 0,
    "dot-notation": 0,
    "no-shadow": 0,
    "no-proto": 0,
    "flowtype/boolean-style": [2, "boolean"],
    "flowtype/define-flow-type": 1,
    "flowtype/delimiter-dangle": [2, "always-multiline"],
    "flowtype/generic-spacing": [2, "never"],
    "flowtype/no-dupe-keys": 2,
    "flowtype/no-primitive-constructor-types": 2,
    "flowtype/no-types-missing-file-annotation": 0,
    "flowtype/no-unused-expressions": 2,
    "flowtype/no-weak-types": 2,
    "flowtype/object-type-delimiter": "comma",
    "flowtype/require-parameter-type": 0,
    "flowtype/require-return-type": 0,
    "flowtype/require-valid-file-annotation": [
      2,
      "always",
      {"annotationStyle": "block"},
    ],
    "flowtype/semi": 2,
    "flowtype/space-after-type-colon": [2, "always"],
    "flowtype/space-before-generic-bracket": [2, "never"],
    "flowtype/space-before-type-colon": [2, "never"],
    "flowtype/union-intersection-spacing": [2, "always"],
    "flowtype/use-flow-type": 1, //TODO: What the hell does this do?
  },
  "settings": {
    "flowtype": {"onlyFilesWithFlowAnnotation": false},
  },
};

// `clean` task

export function clean() {
  return del([
    "lib/",
  ], {force: true});
}


// `lib`...

export function lib() {
  const presets = [["@babel/preset-env", {targets: {node: "8.9"}, modules: "commonjs"}]];

  return gulp.src("src/**/*.js")
    .pipe(eslint(eslintConfig))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(jscc({ values: { _DEBUG: process.env.DEBUG } }))
    .pipe(babel({plugins: ["@babel/transform-flow-strip-types"], presets}))
    .pipe(gulp.dest("lib/"));
}

export function schema() {
  const presets = [["@babel/preset-env", {targets: {node: "8.9"}, modules: "commonjs"}]];

  return gulp.src("src/schema.capnp.js")
    .pipe(eslint(eslintConfig))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(babel({plugins: ["@babel/transform-flow-strip-types"], presets}))
    .pipe(gulp.dest("lib"));
}
