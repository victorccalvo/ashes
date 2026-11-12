'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
fs.mkdirSync(out,{recursive:true});
// Publish only runtime files and artwork, excluding tests and authoring notes.
for(const file of fs.readdirSync(root))if(file==='index.html'||file.endsWith('.css')||file.endsWith('.js'))fs.copyFileSync(path.join(root,file),path.join(out,file));
fs.mkdirSync(path.join(out,'assets'),{recursive:true});
for(const file of fs.readdirSync(path.join(root,'assets')))if(file.endsWith('.png'))fs.copyFileSync(path.join(root,'assets',file),path.join(out,'assets',file));
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log('Static site ready in dist/');
