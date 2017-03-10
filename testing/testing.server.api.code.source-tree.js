let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
let sourceTree = require('../src/server/API/code/source-tree.js');

describe('source-tree', function() {
  it('the source tree with ignore', (done)=>{
    console.log('testing source tree')
    sourceTree("/home/peter/workspace/webtalk/src/main/webapp")
        .then((theTree)=>{
  
            console.log('done - testing source tree');
            //require('fs').writeFileSync("tree.json", JSON.stringify(theTree, undefined, 2));  
            console.log(JSON.stringify(theTree, undefined, 2));
            done();
        })

  });
});