var watch = require('node-watch');

process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });

watch('/media/alexis/Workspace/Intellij WorkSpace/Sounderash/', { recursive: true }, function(evt, name) {
 console.log('%s changed.', name);
});

