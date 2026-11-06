import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync('assets/icon.svg', 'utf8');

for (const size of [256, 512]) {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: size,
    },
  });
  const pngData = resvg.render();
  writeFileSync(`assets/icon-${size}.png`, pngData.asPng());
  console.log(`Generated assets/icon-${size}.png`);
}
