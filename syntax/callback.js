// function a() {
//   console.log('A');
// }

const a = function() {
   console.log('A');
}

function slowfunc(cb) {
  cb();
}

slowfunc(a);