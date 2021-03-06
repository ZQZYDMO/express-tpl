#!/usr/bin/env node
const params = require('commander');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const package = require('./package.json');
const copydir = require('copy-dir');

params.version(package.json)
    .option('-d, --dir [directory]', 'The directory to save the project','.')
    .option('-n, --name [name]', 'The project name','express-tpl')
    //.option('-p, --package [pacakge]','The package you want to use')
    .parse(process.argv);

let dst = path.resolve(params.dir);
if (!fs.existsSync(dst)) {
    console.info('The destination file %s does not exists:',dst,'create it');
    fs.mkdirSync(dst);
}
dst = path.join(dst,params.name);
if (fs.existsSync(dst)) {
    console.warn('The current folder has exists, can not create the project in',dst);
    process.exit();
}

function writeTo(tplFile,data,outFile) {
    const tplStr = fs.readFileSync(path.join(__dirname, tplFile),{encoding:'utf-8'});
    const outStr = ejs.render(tplStr,data);
    fs.writeFileSync(path.join(dst,outFile),outStr);
}


const src = path.join(__dirname,'./tpl');
copydir.sync(src,dst,function(stat,filepath,filename) {
    if (filename === 'package.json.ejs'
    || filename === 'package.json'
    || filename === 'config.json'
    || filename === 'process.json'
    || filename === 'process.example.json') {
        return false;
    }
    return true;
},function(err) {
    if (err) {
        return console.error('copy error:',err);
    }
});
writeTo('./tpl/package.json.ejs',{packageName:params.name},'./package.json');
writeTo('./tpl/process.example.json',{packageName:params.name},'./process.example.json');


