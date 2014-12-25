#!/usr/bin/env node

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');

var base = process.cwd();

var clone = function (done) {
    console.log(' Cloning repository...');
    var git = spawn('git', [
        'clone',
        '--branch', 'master',
        '--depth', '1',
        'https://github.com/kentonv/capnproto.git',
        'compiler'
    ]);

    var errOut = '';
    git.stderr.on('data', function (err) { errOut += err; });
    git.on('close', function (code) {
        if (code !== 0) throw new Error(errOut);
        done();
    });
};

var build = function (done) {
    var cmd = [
        'mkdir compiler/build',
        'cd compiler/c++',
        'autoreconf -i',
        './configure --prefix='+base+'/compiler/build',
        'make -j4',
        'make install',
        'cd ../../bin',
        'rm -f capnp',
        'ln -s ../compiler/build/bin/capnp'
    ];

    console.log(' Building...');
    exec(cmd.join(' && '), function (error, stdout, stderr) {
        if (error) throw new Error(error);

        console.log(' Linked to local Capnproto compiler');
        done();
    });
};

var version = spawn('capnp', ['--version']);
var awk = spawn('awk', ['{print $4}']);

version.stdout.on('data', function (data) { awk.stdin.write(data); });
version.on('close', function () { awk.stdin.end(); });

var n = '';
awk.stdout.on('data', function (data) { n += data; });
awk.on('close', function () {
    if (n.length > 0 && parseFloat(n.slice(0,3)) < 0.5) {
        console.log('No sufficient Capnproto compiler found.  See');
        console.log('http://kentonv.github.io/capnproto/install.html for system-wide compiler');
        console.log('installation--`npm install -g capnp-js-plugin` should reduce this waiting to a');
        console.log('one-time-thing, but it\'s just too magical for my taste.');
        console.log('Installing:');

        /*
         * Dump a local install into the `bin` directory if a compiler was not
         * found.  Since the `bin` directory was spec'ed instead of each
         * individual binary, `npm install` handles installation and path
         * shenanigans.
         */
        clone(function () { build(function () {}); });
    } else {
        console.log('Sufficient Capnproto compiler found.');
    }
});
