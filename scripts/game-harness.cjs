const fs=require('fs'),vm=require('vm');
module.exports=function(){
 const source=fs.readFileSync('smoke-test.cjs','utf8').split('const c=boot();')[0];
 const harness=source.replace(/vm\.runInContext\(fs\.readFileSync\('game.js'[\s\S]*?,c\);return c;/,"for(const m of fs.readFileSync('index.html','utf8').matchAll(/<script src=\"([^\"]+)\"/g))vm.runInContext(fs.readFileSync(m[1],'utf8'),c);return c;");
 return new Function('require',harness+'\nreturn {context:boot(),storage};')(require);
};
