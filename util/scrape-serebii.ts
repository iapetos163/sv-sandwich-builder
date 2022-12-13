// WHY IS DOING THNIS IN NODEJS SO HELLISH
import { readFile, writeFile } from 'fs/promises';
import { DOMParser } from '@xmldom/xmldom';
import got from 'got';
import * as xpath from 'xpath';

const getTableRows = (doc: Document, tableHeading: string) => {
  const nodes1 = xpath.select(`//h2[text()="${tableHeading}"]`, doc);

  let currentNode: Node | null = (nodes1[0] as Node).parentNode!;
  while (currentNode && currentNode.nodeName !== 'table') {
    currentNode = currentNode.nextSibling;
  }

  if (!currentNode) throw 'oh heck';
  const childNodes = Array.from(currentNode.childNodes);
  return childNodes
    .filter((row) => row.childNodes)
    .slice(1)
    .map((row) =>
      Array.from(row.childNodes).filter((cn) => cn.nodeName === 'td'),
    );
};

const main = async () => {
  // const res = await got(
  //   'https://www.serebii.net/scarletviolet/sandwichingredients.shtml',
  // );

  // await writeFile('out.html', res.body);
  // const docSource = res.body;
  const docSource = await readFile('out.html', 'utf8');

  const doc = new DOMParser({
    errorHandler() {},
  }).parseFromString(docSource);

  const rowNodes = getTableRows(doc, 'List of Ingredients');
  console.log(rowNodes[0]);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
