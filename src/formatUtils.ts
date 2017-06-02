import * as yaml from "js-yaml";

export module FormatUtils {
  export function produceFile(entry: any): string {
    let copy = {...entry};
    if (entry.content) {
      delete copy.content;
      return `---
${yaml.dump(copy)}
---
${copy.content}`;
    } else {
      return yaml.dump(copy);
    }
  }

  export function readFile(file: string): any {
    try {
      let frontMatterDelimiter = /^---\s*$/;
      let lines = file.split('\n');
      if (lines.length > 3 && lines[0].match(frontMatterDelimiter)) {
        let frontMatter = "";
        let markdown = "";
        let inFrontMatter = true
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (inFrontMatter && line.match(frontMatterDelimiter)) {
            inFrontMatter = false;
          } else {
            if (inFrontMatter) {
              frontMatter = frontMatter + line + "\n";
            } else {
              markdown = markdown + line + "\n";
            }
          }
        }
        let entry = yaml.load(frontMatter);
        entry.content = markdown;
        return entry;
      }
    } catch (e) {
      return null;
    }
  }
}

export default FormatUtils;
