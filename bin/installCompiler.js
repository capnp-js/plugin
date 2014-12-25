#!/usr/bin/env node

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var base = process.cwd();

var clone = function (done) {
    console.log('Cloning repository...');
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
        './configure --prefix='+base+'/compiler/build --bindir='+base+'/bin',
        'make -j4',
        'make install'
    ];

    console.log('Building...');
    exec(cmd.join(' && '), function (error, stdout, stderr) {
        if (error) throw new Error(error);

        console.log('Linked to Capnproto compiler.');
        done();
    });
};

clone(function () { build(function () {}); });
