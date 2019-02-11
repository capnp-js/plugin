/* @flow */

/* TODO: Migrate to test and clobber from this compilation unit:
p = new Printer(2);

p.line("import type { K } from \"./asdf\";");
p.blank();
p.block("class SomeClass", p => {
  p.line("member: string;");
  p.line("another: K;");
  p.blank();
  p.block("constructor(member: string)", p => {
    p.line("this.member = member");
  });
  p.blank();
  p.block("fn(concat: string)", p => {
    p.ifElse(
      "concat === \"\"",
      p => p.line("this.member += \"some default\";"),
      p => p.line("this.member += concat")
    );
  });
});
*/

//TODO: Generic specialization with Text? The setter variant for `"someString"`
//cannot work, right? So shouldn't I afford a quick `internText` function for
//creating Text outside of any arena for setting? 

type uint = number;

class Words {
  +s: string;
  p: uint;

  constructor(s: string) {
    this.s = s;
    this.p = 0;
    while (this.p < this.s.length && this.s.charAt(this.p) === " ") ++this.p;
  }

  next(): IteratorResult<string, void> {
    if (this.p === this.s.length) {
      return { done: true };
    } else {
      let value = "";
      do {
        value += this.s.charAt(this.p);
        ++this.p;
      } while (this.p < this.s.length && this.s.charAt(this.p) !== " ");

      return { done: false, value };
    }
  }
}

export default class Printer {
  +indentWidth: uint;
  level: uint;
  text: string;
  interrupted: boolean;

  constructor(indentWidth: uint) {
    this.indentWidth = indentWidth;
    this.level = 0;
    this.text = "";
    this.interrupted = true;
  }

  indent(cb: (p: this) => void): void {
    ++this.level;
    cb(this);
    --this.level;
  }

  interrupt(): void {
    if (!this.interrupted) {
      this.text += "\n";
      this.interrupted = true;
    }
  }

  comment(s: string): void {
    let line = " ".repeat(this.level * this.indentWidth) + "/*";
    const words = new Words(s);
    for (let w=words.next(); !w.done; w=words.next()) {
      if (line.length + 1 + w.value.length < 80) {
        line += " ";
        line += w.value;
      } else {
        this.text += line;
        this.text += "\n";
        line = " ".repeat(this.level * this.indentWidth) + " * " + w.value;
      }
    }

    if (line.length + 3 < 80) {
      line += " */";
      this.text += line;
      this.text += "\n";
    } else {
      this.text += line;
      this.text += "\n";
      line = " ".repeat(this.level * this.indentWidth) + " */";
      this.text += line;
      this.text += "\n";
    }

    this.interrupted = false;
  }

  line(s: string): void {
    this.text += " ".repeat(this.level * this.indentWidth);
    this.text += s;
    this.text += "\n";

    this.interrupted = false;
  }

  block(prefix: string, cb: (p: this) => void): void {
    this.text += " ".repeat(this.level * this.indentWidth);
    this.text += prefix;
    if (prefix !== "") {
      /* Only add a space when there exists a prefix. */
      this.text += " ";
    }
    this.text += "{\n";

    ++this.level;
    this.interrupted = true;
    cb(this);
    --this.level;

    this.text += " ".repeat(this.level * this.indentWidth);
    this.text += "}\n";

    this.interrupted = false;
  }

  if(predicate: string, ifCb: (p: this) => void): void {
    this.text += " ".repeat(this.level * this.indentWidth);
    this.text += "if (";
    this.text += predicate;
    this.text += ") {\n";

    ++this.level;
    this.interrupted = true;
    ifCb(this);
    --this.level;

    this.text += " ".repeat(this.level * this.indentWidth);
    this.text += "}\n";

    this.interrupted = false;
  }

  ifElse(predicate: string, ifCb: (p: this) => void, elseCb: (p: this) => void): void {
    this.text += " ".repeat(this.level * this.indentWidth);
    this.text += "if (";
    this.text += predicate;
    this.text += ") {\n";

    ++this.level;
    this.interrupted = true;
    ifCb(this);
    --this.level;

    this.text += " ".repeat(this.level * this.indentWidth);
    this.text += "} else {\n";

    ++this.level;
    this.interrupted = true;
    elseCb(this);
    --this.level;

    this.text += " ".repeat(this.level * this.indentWidth);
    this.text += "}\n";

    this.interrupted = false;
  }
}
