#!/usr/bin/env node

var when = require('when/node');
var exec = when.lift(require('child_process').exec);
var whereis = when.lift(require('whereis'));

var base = process.cwd();

whereis('capnp')
    .then(function (out) {
        return exec(out + " --version | awk '{print $4}'")
            .then(function (version) {
                // Verify that the compiler version is at 0.5 or greater.
                if (parseFloat(version.slice(0,3)) >= 0.5) {
                    console.log('Found a Capnproto compiler: ' + out);
                    return out;
                }

                console.log('Installing a Capnproto compiler');
                var cmd = [
                    'rm -rf compiler',
                    '&&',
                    'git',
                    'clone',
                    '--branch master',
                    '--depth 1',
                    'https://github.com/kentonv/capnproto.git',
                    'compiler'
                ];

                console.log(' Cloning repository');
                return exec(cmd.join(' '))
                    .then(function () {
                        var cmd = [
                            'mkdir compiler/build',
                            'cd compiler/c++',
                            'autoreconf -i',
                            './configure --prefix='+base+'/compiler/build',
                            'make -j4',
                            'make install'
                        ];

                        console.log(' Building');
                        return exec(cmd.join('&&'));
                    })
                    .then(function () {
                        return '../compiler/build/bin/capnp'
                    });
            });
    })
    .then(function (bin) {
        console.log('Linking Capnproto compiler to local: ' + bin);
        return exec('cd bin && rm -f capnp && ln -s ' + bin);
    });
