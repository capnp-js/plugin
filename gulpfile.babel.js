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

export function compile() {
  function file(filename) {
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

  return Promise.all([
    file("const-void.capnp"),
    file("const-bool.capnp"),
    file("const-int8.capnp"),
    file("const-int16.capnp"),
    file("const-int32.capnp"),
    file("const-int64.capnp"),
    file("const-uint8.capnp"),
    file("const-uint16.capnp"),
    file("const-uint32.capnp"),
    file("const-uint64.capnp"),
    file("const-float32.capnp"),
    file("const-float64.capnp"),
    file("const-text.capnp"),
    file("const-data.capnp"),
    file("const-listVoid.capnp"),
    file("const-listBool.capnp"),
    file("const-listInt8.capnp"),
    file("const-listInt16.capnp"),
    file("const-listInt32.capnp"),
    file("const-listInt64.capnp"),
    file("const-listUint8.capnp"),
    file("const-listUint16.capnp"),
    file("const-listUint32.capnp"),
    file("const-listUint64.capnp"),
    file("const-listFloat32.capnp"),
    file("const-listFloat64.capnp"),
    file("const-listText.capnp"),
    file("const-listData.capnp"),
    file("const-enum.capnp"),
    file("const-struct.capnp"),
    file("const-genericStructBoolList.capnp"),
    file("const-genericStructInt16List.capnp"),
    file("const-genericStructStruct.capnp"),
    file("const-genericStructText.capnp"),
    file("field-void.capnp"),
    file("field-bool.capnp"),
    file("field-int8.capnp"),
    file("field-int16.capnp"),
    file("field-int32.capnp"),
    file("field-int64.capnp"),
    file("field-uint8.capnp"),
    file("field-uint16.capnp"),
    file("field-uint32.capnp"),
    file("field-uint64.capnp"),
    file("field-float32.capnp"),
    file("field-float64.capnp"),
    file("field-text.capnp"),
    file("field-data.capnp"),
    file("field-listVoid.capnp"),
    file("field-listBool.capnp"),
    file("field-listInt8.capnp"),
    file("field-listInt16.capnp"),
    file("field-listInt32.capnp"),
    file("field-listInt64.capnp"),
    file("field-listUint8.capnp"),
    file("field-listUint16.capnp"),
    file("field-listUint32.capnp"),
    file("field-listUint64.capnp"),
    file("field-listFloat32.capnp"),
    file("field-listFloat64.capnp"),
    file("field-listText.capnp"),
    file("field-listData.capnp"),
    file("field-enum.capnp"),
    file("field-struct.capnp"),
    file("field-genericStructBoolList.capnp"),
    file("field-genericStructInt16List.capnp"),
    file("field-genericStructStruct.capnp"),
    file("field-genericStructText.capnp"),
    file("defField-void.capnp"),
    file("defField-bool.capnp"),
    file("defField-int8.capnp"),
    file("defField-int16.capnp"),
    file("defField-int32.capnp"),
    file("defField-int64.capnp"),
    file("defField-uint8.capnp"),
    file("defField-uint16.capnp"),
    file("defField-uint32.capnp"),
    file("defField-uint64.capnp"),
    file("defField-float32.capnp"),
    file("defField-float64.capnp"),
    file("defField-text.capnp"),
    file("defField-data.capnp"),
    file("defField-listVoid.capnp"),
    file("defField-listBool.capnp"),
    file("defField-listInt8.capnp"),
    file("defField-listInt16.capnp"),
    file("defField-listInt32.capnp"),
    file("defField-listInt64.capnp"),
    file("defField-listUint8.capnp"),
    file("defField-listUint16.capnp"),
    file("defField-listUint32.capnp"),
    file("defField-listUint64.capnp"),
    file("defField-listFloat32.capnp"),
    file("defField-listFloat64.capnp"),
    file("defField-listText.capnp"),
    file("defField-listData.capnp"),
    file("defField-enum.capnp"),
    file("defField-struct.capnp"),
    file("defField-genericStructBoolList.capnp"),
    file("defField-genericStructInt16List.capnp"),
    file("defField-genericStructStruct.capnp"),
    file("defField-genericStructText.capnp"),
  ]);
}
