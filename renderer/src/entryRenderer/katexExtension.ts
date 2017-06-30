import katex from "katex";
import $ from "jquery";

let katexCache: { [katex: string]: string } = {};

export default {
  type: 'output',
  filter: function(html: string) {
    if (!$('#katex-latex-styles').length) {
      $('head').append(`
<style id="katex-latex-styles" type="text/css">
.katex-latex {
  font-size: 20px;
}
</style>`);
    }

    var $div = $('<div></div>').html(html);
    var $latex = $('code.latex.language-latex', $div);

    if ($latex.length) {
      $latex.unwrap().each(function(i, e) {
        var latexEl = $(e);
        var htmlFromLatex = katex.renderToString(latexEl.text(), {
          displayMode: true,
          throwOnError: false,
          errorColor: '#00c2c9'
        });
        latexEl.replaceWith(`<div class="katex-latex">${htmlFromLatex}</div>`);
      });
    }
    console.log($div.html());
    return $div.html();
  }
}
