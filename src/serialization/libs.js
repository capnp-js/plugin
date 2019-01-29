/* @flow */

export type Libs = {
  +names: Set<string>,
  +type: {
    +int64: { [naive: string]: string },
    +uint64: { [naive: string]: string },
    +layout: { [naive: string]: string },
    +memory: { [naive: string]: string },
    +"reader-core": { [naive: string]: string },
    +"builder-core": { [naive: string]: string },
  },
  +value: {
    +int64: { [naive: string]: string },
    +uint64: { [naive: string]: string },
    +layout: { [naive: string]: string },
    +memory: { [naive: string]: string },
    +"reader-core": { [naive: string]: string },
    +"builder-core": { [naive: string]: string },
    +"reader-arena": { [naive: string]: string },
  },
  +"all-value": {
    "read-data": null | "decode",
    "write-data": null | "encode",
  },
};
