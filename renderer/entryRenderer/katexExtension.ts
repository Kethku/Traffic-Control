import * as katex from "katex";
import * as $ from "jquery";

let katexCache: { [katex: string]: string } = {};

function addLatexStyles() {
      if (!$('#katex-latex-styles').length) {
        $('head').append(`
<link id="katex-latex-styles" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.8.3/katex.min.css" integrity="sha384-B41nY7vEWuDrE9Mr+J2nBL0Liu+nl/rBXTdpQal730oTHdlrlXHzYMOhDU60cwde" crossorigin="anonymous">`);
      }
}

export default [
  {
    type: 'lang',
    regex: /\$([^]+?)\$/,
    replace: function(s: string, match: string) {
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
