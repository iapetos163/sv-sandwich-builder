/* DEPRECATED */
import { readFile, writeFile } from 'fs/promises';
import { basename, join as joinPath } from 'path';
import { DOMParser } from '@xmldom/xmldom';
import arg from 'arg';
import got from 'got';
import * as xpath from 'xpath';
import { mealPowers, allTypes } from '../src/powers';

interface ParsedIngredient {
  ingredientImagePath: string;
  ingredientPagePath: string;
  ingredientName: string;
  mealPowerBoosts: Record<string, number>;
  typeBoosts: Record<string, number>;
  mealPowerVector: number[];
  typeVector: number[];
}

const outputPath = 'src/data.json';

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
      Array.from(row.childNodes).filter(
        (cn): cn is Element => cn.nodeName === 'td',
      ),
    );
};

const parseImageCell = (cell: Node) => {
  const anchor = cell.firstChild as Element;
  // const ingredientPagePath = anchor.attributes.getNamedItem('href')!.value;
  const ingredientImagePath = (
    anchor.firstChild as Element
  ).attributes.getNamedItem('src')!.value;
  return {
    // ingredientPagePath,
    ingredientImagePath,
  };
};
const parseNameCell = (cell: Node) => {
  const anchor = cell.firstChild as Element;
  const ingredientPagePath = anchor.attributes.getNamedItem('href')!.value;
  const ingredientName = anchor.textContent!;
  return {
    ingredientPagePath,
    ingredientName,
  };
};

const parseBoostsCell = (cell: Node) => {
  const tbody = cell.firstChild as Element;
  const results: Record<string, number> = {};
  for (const cn of Array.from(tbody.childNodes)) {
    if (cn.nodeName !== 'tr') continue;

    const labelCell = cn.firstChild as Element;
    const valueCell = cn.lastChild as Element;

    const label = (labelCell.firstChild as Element).textContent!.split(':')[0];
    const value = parseInt((valueCell as Element).textContent!);
    results[label] = value;
  }

  return results;
};

const parseRow = (nodes: Node[]): ParsedIngredient => {
  const [imageCell, nameCell, tasteCell, mealPowerCell, typeCell] = nodes;
  const mealPowerBoosts = parseBoostsCell(mealPowerCell);
  const typeBoosts = parseBoostsCell(typeCell);
  const mealPowerVector = mealPowers.map((mp) => mealPowerBoosts[mp] ?? 0);
  const typeVector = allTypes.map((t) => typeBoosts[t] ?? 0);

  return {
    ...parseImageCell(imageCell),
    ...parseNameCell(nameCell),
    mealPowerBoosts,
    typeBoosts,
    mealPowerVector,
    typeVector,
  };
};

const makeIngredientData = ({
  ingredientImagePath,
  ...ing
}: ParsedIngredient) => ({
  ingredientImageBasename: basename(ingredientImagePath),
  ...ing,
});

const main = async () => {
  const args = arg({
    '--cached': Boolean,
    '--skip-images': Boolean,

    '-c': '--cached',
    '-s': '--skip-images',
  });

  let docSource: string;
  if (args['--cached']) {
    docSource = await readFile('out.html', 'utf8');
  } else {
    const res = await got(
      'https://www.serebii.net/scarletviolet/sandwichingredients.shtml',
    );
    docSource = res.body;

    await writeFile('sandwichingredients.html', res.body);
  }

  const doc = new DOMParser({
    errorHandler() {},
  }).parseFromString(docSource);

  const rowNodes = getTableRows(doc, 'List of Ingredients');
  const ingredients = rowNodes.map(parseRow);
  const seasoningRows = getTableRows(doc, 'List of Seasoning');
  const seasonings = seasoningRows.map(parseRow);

  const outputData = {
    ingredients: ingredients.map(makeIngredientData),
    seasonings: seasonings.map(makeIngredientData),
  };

  await writeFile(outputPath, JSON.stringify(outputData));
  console.log(`Exported ${outputPath}`);

  if (args['--skip-images']) return;
  for (const { ingredientImagePath } of ingredients.concat(seasonings)) {
    const res = await got(`https://www.serebii.net${ingredientImagePath}`, {
      responseType: 'buffer',
    });
    const imgOutPath = joinPath(
      'src/assets/dynamic',
      basename(ingredientImagePath),
    );
    await writeFile(imgOutPath, res.body);
    console.log(`Exported ${imgOutPath}`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
