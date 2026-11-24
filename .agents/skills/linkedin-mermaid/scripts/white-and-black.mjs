import sharp from 'sharp';

const [output, ...inputs] = process.argv.slice(2);
if (!output || inputs.length === 0) {
  throw new Error('Użycie: white-and-black.mjs podgląd.png diagram.png [kolejne-diagramy.png]');
}

const panelWidth = 1200;
const padding = 32;
const panelContentSize = panelWidth - 2 * padding;
const dimensions = await Promise.all(inputs.map((input) => sharp(input).metadata()));
const largestSide = Math.max(...dimensions.map(({ width, height }) => Math.max(width, height)));
const scale = Math.min(1, panelContentSize / largestSide);
const layers = [];
let height = padding;

for (const [index, input] of inputs.entries()) {
  const { width, height: inputHeight } = dimensions[index];
  const resize = width >= inputHeight
    ? { width: Math.max(1, Math.round(width * scale)) }
    : { height: Math.max(1, Math.round(inputHeight * scale)) };
  const { data, info } = await sharp(input).resize(resize)
    .png()
    .toBuffer({ resolveWithObject: true });
  const left = Math.floor((panelWidth - info.width) / 2);
  layers.push(
    { input: data, left, top: height },
    { input: data, left: left + panelWidth, top: height }
  );
  height += info.height + padding;
}

const background = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${2 * panelWidth}" height="${height}">` +
  `<rect width="${panelWidth}" height="${height}" fill="#fff"/>` +
  `<rect x="${panelWidth}" width="${panelWidth}" height="${height}" fill="#000"/>` +
  '</svg>'
);

await sharp(background).composite(layers).removeAlpha().png().toFile(output);
