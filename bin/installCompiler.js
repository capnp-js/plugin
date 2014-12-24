#!/usr/bin/env node

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

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

var version = spawn('capnp', ['--version']); // Finds prior local installs
var awk = spawn('awk', ['{print $4}']);

version.stderr.on('data', function (err) { throw new Error(err); });
awk.stderr.on('data', function (err) { throw new Error(err); });

version.stdout.on('data', function (data) { awk.stdin.write(data); });
version.on('close', function () { awk.stdin.end(); });

var n = '';
awk.stdout.on('data', function (data) { n += data; });
awk.on('close', function () {
    if (parseFloat(n.slice(0,3)) >= 0.5) {
        console.log('Found a Capnproto compiler');
    } else {
        console.log('No Capnproto compiler found.  Installing:');

        var rm = spawn('rm', ['-rf', 'compiler']);
        rm.on('close', function () {
            clone(function () {
                build(function () {});
            });
        });
    }
});
