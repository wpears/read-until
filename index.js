var fs = require('fs');

function readUntil(file, match, bytes, cb){

  if(typeof bytes === 'function'){
    cb = bytes;
    bytes = 256;
  }

  //bytes*15 (0b1111) allows for four writes before rewriting buffer
  var buffer = new Buffer(bytes*15);
  var bytesBeforeMatch = 0;
  var fd;
  var matcher = makeMatcher();
  

  fs.open(file, 'r', function(err, fileDesc){
    if(err) cb(err);
    fd = fileDesc;
    read(bytes);
  });


  function read(byteLength){
    return fs.read(fd, buffer, bytesBeforeMatch, byteLength, bytesBeforeMatch, parseMatch);
  }


  function parseMatch(err, bytesRead, buf){
    console.log(bytesBeforeMatch, bytesRead);
    if(err) cb(err); 
    
    //subtract 6 so weird astral code points aren't borked
    var startBytes = bytesBeforeMatch;
    var sliceStart = startBytes - 6;
    if(sliceStart<0) sliceStart = 0;
    //sliceDiff to track the byte offset when adding the match index
    var sliceDiff = startBytes - sliceStart;

    var str = buf.slice(sliceStart, startBytes + bytesRead).toString();
    var index = matcher(str);

    if(index > -1){
      bytesBeforeMatch += index - sliceDiff;
      return cb(null,buf.slice(0, bytesBeforeMatch));
    }else{
      bytesBeforeMatch += bytesRead; 
      
      //Reached EOF
      if(bytesRead <= startBytes){
        return cb(new Error('No match.'));
      }

      checkBuffer();
      return read(bytesRead * 2);
    }
  }


  function makeMatcher(){
    if(typeof match === 'string'){
      return function(str){return str.indexOf(match)}
    }
    return function(str){return str.search(match)}
  }


  function checkBuffer(){
    if(bytesBeforeMatch === buffer.length){
      var newBuf = new Buffer(bytesBeforeMatch * 15);  
      buffer.copy(newBuf);
      buffer = newBuf;
    }
  }

}

module.exports = readUntil;
