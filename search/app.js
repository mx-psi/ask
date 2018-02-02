require([
  'lib/jquery.js',
  'lib/mustache.js',
  'lib/elasticlunr.js',
  'lib/lunr.stemmer.support.js',
  'lib/lunr.es.js',
  'lib/marked.js',
  'lib/text!templates/question_list.mustache',
  'lib/text!data/interesting.json',
  'lib/text!data/index.json'
], function (_, Mustache, elasticlunr, stemmerSupport, es, marked, questionList, data, indexDump) {

  // Support for language
  stemmerSupport(elasticlunr)
  es(elasticlunr)

  // Muestra lista de preguntas
  var renderQuestionList = function (qs) {
    $("#question-list-container")
      .empty()
      .append(Mustache.to_html(questionList, {questions: qs}))
  }

  // Búsqueda
  window.profile = function (term) {
    console.profile('search')
    idx.search(term)
    console.profileEnd('search')
  }

  // Búsqueda
  window.search = function (term) {
    console.time('search')
    idx.search(term)
    console.timeEnd('search')
  }


  // Obten datos
  var indexDump = JSON.parse(indexDump)
  window.idx = elasticlunr.Index.load(indexDump)
  var questions = JSON.parse(data).map(function (raw) {
    return {id: raw.id, title: marked(raw.comment), body: marked(raw.reply), time: raw.time }
  })

  // Vista inicial
  renderQuestionList(questions)

  $('a.all').bind('click', function () {
    renderQuestionList(questions)
    $('input').val('')
  })

  var debounce = function (fn) {
    var timeout
    return function () {
      var args = Array.prototype.slice.call(arguments),
          ctx = this
      clearTimeout(timeout)
      timeout = setTimeout(function () {fn.apply(ctx, args)}, 100)
    }
  }

  $('input').bind('keyup', debounce(function () {
    if ($(this).val() < 2) return

    var json_config = {"fields": {"title": {"boost": 2}, "body": {"boost": 1}}, "boolean": "OR"};
    var query = $(this).val()
    var results = idx.search(query, json_config).map(function (result) {
      return questions.filter(function (q) {return q.id === parseInt(result.ref, 10)})[0]
    })
    renderQuestionList(results)
  }))
})
