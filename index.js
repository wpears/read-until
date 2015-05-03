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
    read(0, bytes);
  });


  function read(offset, byteLength){
    return fs.read(fd, buffer, offset, byteLength, offset, parseMatch);
  }


  function parseMatch(err, bytesRead, buf){
    if(err) cb(err); 
    
    //add 6 so weird astral code points aren't borked
    var str = buf.slice(-(bytesRead + 6));
    var test = str.match(match);

    if(test){
      bytesBeforeMatch += test.index;
      return cb(null,buf.slice(0, bytesBeforeMatch));
    }else{
      bytesBeforeMatch += bytesRead; 
      checkBuffer();
      return read(bytesBeforeMatch, bytesRead * 2);
    }
  }

}
