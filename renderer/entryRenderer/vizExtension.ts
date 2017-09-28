import * as Viz from "viz.js";

let graphCache: { [graph: string]: string } = {};

export default {
  type: 'lang',
  regex: /```graph([^]+?)```/gi,
  replace: function(s: string, match: string) {
    let digraphRegex = /digraph\s+{/g;
    match = match.replace(digraphRegex, "digraph { bgcolor=\"transparent\"; ");
    let graphSVG: string;
    if (match in graphCache) {
      graphSVG = graphCache[match];
    } else {
      graphSVG = Viz(match, {format: "svg"}) as string;
      graphCache[match] = graphSVG;
    }
    return `<div>${graphSVG}</div>`;
  }
}
