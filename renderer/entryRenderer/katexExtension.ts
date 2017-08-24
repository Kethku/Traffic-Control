import katex from "katex";
import * as $ from "jquery";

let katexCache: { [katex: string]: string } = {};

function addLatexStyles() {
      if (!$('#katex-latex-styles').length) {
        $('head').append(`
<style id="katex-latex-styles" type="text/css">
.katex-latex {
font-size: 20px;
}
</style>`);
      }
}

export default [
  {
    type: 'lang',
    regex: /\$([^]+?)\$/,
    replace: function(s: any, match: any) {
      addLatexStyles();
      return `
<span class="katex-latex">
    ${katex.renderToString(match, {displayMode: true, throwOnError: false, errorColor: '#00c2c9'})}
</span>`
    }
  }, {
    type: 'output',
    filter: function(html: string) {
      addLatexStyles();
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
]
