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
  

  fs.open(file, 'r', function(err, fileDesc){
    if(err) cb(err);
    fd = fileDesc;
    read(bytes);
  });


  function read(byteLength){
    return fs.read(fd, buffer, bytesBeforeMatch, byteLength, bytesBeforeMatch, parseMatch);
  }


  function parseMatch(err, bytesRead, buf){
    if(err) cb(err); 
    
    //subtract 6 so weird astral code points aren't borked
    var startBytes = bytesBeforeMatch;
    var sliceStart = startBytes - 6;
    if(sliceStart<0) sliceStart = 0;

    var str = buf.slice(sliceStart, startBytes + bytesRead).toString();
    var test = str.match(match);
    if(test){
      bytesBeforeMatch += test.index;
      return cb(null,buf.slice(0, bytesBeforeMatch));
    }else{
      bytesBeforeMatch += bytesRead; 
      
      //Reached EOF
      if(bytesRead <= startBytes){
        return cb(new Error('No match.'));
      }

      checkBuffer();
      return read(bytesBeforeMatch, bytesRead * 2);
    }
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
