import { writeFile } from 'fs/promises';
import got from 'got';

const main = async () => {
  for (let i = 75; i < 93; i++) {
    const res = await got(
      `https://www.serebii.net/scarletviolet/meals/${i}.png`,
      {
        responseType: 'buffer',
      },
    );
    const imgOutPath = `public/assets/meal/${i}.png`;
    await writeFile(imgOutPath, res.body);
    console.log(`Exported ${imgOutPath}`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
