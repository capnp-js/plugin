import { exec } from "child_process";
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
    "integration/*.js",
    "test/*.js",
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

export function lint() {
  return gulp.src(["test/*.js", "integration/*.js"])
    .pipe(eslint(eslintConfig))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

export function compile() {
  function test(filename) {
    const plugin = process.env.PWD + "/lib/bin/flow.js";
    return new Promise((resolve, reject) => {
      exec(
        `capnp compile --src-prefix test/schema -o ${plugin}:test ${process.env.PWD}/test/schema/${filename}`,
        (error, stdout, stderr) => {
          if (error !== null && error.code !== 0) {
            console.log("stdout: " + stdout);
            console.log("stderr: " + stderr);
            reject(error.code);
          } else {
            resolve(0);
          }
        },
      );
    });
  }

  function integration(filename) {
    const plugin = process.env.PWD + "/lib/bin/flow.js";
    return new Promise((resolve, reject) => {
      exec(
        `capnp compile --src-prefix integration/schema -o ${plugin}:integration ${process.env.PWD}/integration/schema/${filename}`,
        (error, stdout, stderr) => {
          if (error !== null && error.code !== 0) {
            console.log("stdout: " + stdout);
            console.log("stderr: " + stderr);
            reject(error.code);
          } else {
            resolve(0);
          }
        },
      );
    });
  }

  const integrations = Promise.all([
    integration("generic.capnp"),
    integration("group.capnp"),
    integration("plain.capnp"),
  ]);

  const tests = Promise.all([
    test("const-void.capnp"),
    test("const-bool.capnp"),
    test("const-int8.capnp"),
    test("const-int16.capnp"),
    test("const-int32.capnp"),
    test("const-int64.capnp"),
    test("const-uint8.capnp"),
    test("const-uint16.capnp"),
    test("const-uint32.capnp"),
    test("const-uint64.capnp"),
    test("const-float32.capnp"),
    test("const-float64.capnp"),
    test("const-text.capnp"),
    test("const-data.capnp"),
    test("const-listVoid.capnp"),
    test("const-listBool.capnp"),
    test("const-listInt8.capnp"),
    test("const-listInt16.capnp"),
    test("const-listInt32.capnp"),
    test("const-listInt64.capnp"),
    test("const-listUint8.capnp"),
    test("const-listUint16.capnp"),
    test("const-listUint32.capnp"),
    test("const-listUint64.capnp"),
    test("const-listFloat32.capnp"),
    test("const-listFloat64.capnp"),
    test("const-listText.capnp"),
    test("const-listData.capnp"),
    test("const-enum.capnp"),
    test("const-struct.capnp"),
    test("const-genericStructBoolList.capnp"),
    test("const-genericStructInt16List.capnp"),
    test("const-genericStructStruct.capnp"),
    test("const-genericStructText.capnp"),
    test("field-void.capnp"),
    test("field-bool.capnp"),
    test("field-int8.capnp"),
    test("field-int16.capnp"),
    test("field-int32.capnp"),
    test("field-int64.capnp"),
    test("field-uint8.capnp"),
    test("field-uint16.capnp"),
    test("field-uint32.capnp"),
    test("field-uint64.capnp"),
    test("field-float32.capnp"),
    test("field-float64.capnp"),
    test("field-text.capnp"),
    test("field-data.capnp"),
    test("field-listVoid.capnp"),
    test("field-listBool.capnp"),
    test("field-listInt8.capnp"),
    test("field-listInt16.capnp"),
    test("field-listInt32.capnp"),
    test("field-listInt64.capnp"),
    test("field-listUint8.capnp"),
    test("field-listUint16.capnp"),
    test("field-listUint32.capnp"),
    test("field-listUint64.capnp"),
    test("field-listFloat32.capnp"),
    test("field-listFloat64.capnp"),
    test("field-listText.capnp"),
    test("field-listData.capnp"),
    test("field-enum.capnp"),
    test("field-struct.capnp"),
    test("field-genericStructBoolList.capnp"),
    test("field-genericStructInt16List.capnp"),
    test("field-genericStructStruct.capnp"),
    test("field-genericStructText.capnp"),
    test("defField-void.capnp"),
    test("defField-bool.capnp"),
    test("defField-int8.capnp"),
    test("defField-int16.capnp"),
    test("defField-int32.capnp"),
    test("defField-int64.capnp"),
    test("defField-uint8.capnp"),
    test("defField-uint16.capnp"),
    test("defField-uint32.capnp"),
    test("defField-uint64.capnp"),
    test("defField-float32.capnp"),
    test("defField-float64.capnp"),
    test("defField-text.capnp"),
    test("defField-data.capnp"),
    test("defField-listVoid.capnp"),
    test("defField-listBool.capnp"),
    test("defField-listInt8.capnp"),
    test("defField-listInt16.capnp"),
    test("defField-listInt32.capnp"),
    test("defField-listInt64.capnp"),
    test("defField-listUint8.capnp"),
    test("defField-listUint16.capnp"),
    test("defField-listUint32.capnp"),
    test("defField-listUint64.capnp"),
    test("defField-listFloat32.capnp"),
    test("defField-listFloat64.capnp"),
    test("defField-listText.capnp"),
    test("defField-listData.capnp"),
    test("defField-enum.capnp"),
    test("defField-struct.capnp"),
    test("defField-genericStructBoolList.capnp"),
    test("defField-genericStructInt16List.capnp"),
    test("defField-genericStructStruct.capnp"),
    test("defField-genericStructText.capnp"),
    test("union1.capnp"),
    test("union2.capnp"),
  ]);

  return Promise.all([
    integrations,
    tests,
  ]);
}
