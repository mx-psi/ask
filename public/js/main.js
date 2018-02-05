var simplemde = new SimpleMDE({
  element: document.getElementById("posts[title]"),
  autosave: {
	  enabled: true,
		uniqueId: "posts[title]",
		delay: 1000,
	},
  toolbar: ["bold", "italic", "|", "quote", "link", "|", "preview", "guide"],
  placeholder: "Haz una pregunta!\nTu pregunta será pública en Github antes de ser respondida.",
  spellChecker: false,
  status: false
});

(function ($) {
  $('.question-form').submit(function () {
    var form = this;
    $(form).addClass('form--loading');
    show('Enviando...');

    $.ajax({
      type: $(this).attr('method'),
      url: $(this).attr('action'),
      data: $(this).serialize(),
      contentType: 'application/x-www-form-urlencoded',
      success: function (data) {
        show('Enviado!');
        simplemde.value();
        $(form).removeClass('form--loading');
      },
      error: function (err) {
        console.log(err);
        showModal('Error');
        $(form).removeClass('form--loading');
      }
    });
    return false;
  });

  $('.js-close-modal').click(function () {
    $('body').removeClass('show-modal');
  });

  function show(title) {
    $('.send-button').text(title);
  }
})(jQuery);
