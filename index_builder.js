var elasticlunr = require('./lib/elasticlunr.js'),
    fs = require('fs');

require('./lib/lunr.stemmer.support.js')(elasticlunr);
require('./lib/lunr.es.js')(elasticlunr);

var idx = elasticlunr(function () {
  this.use(elasticlunr.es);
  this.setRef('id');
  this.addField('title');
  this.addField('body');
  this.addField('time');
});

fs.readFile('./data/interesting.json', function (err, data) {
  if (err) throw err;

  var raw = JSON.parse(data);

  var questions = raw.map(function (q) {
    return {
      id: q.id,
      title: q.comment,
      body: q.reply,
      time: q.timestamp,
    };
  });

  questions.forEach(function (question) {
    idx.addDoc(question);
  });

  fs.writeFile('./data/index.json', JSON.stringify(idx), function (err) {
    if (err) throw err;
    console.log('done');
  });
});
