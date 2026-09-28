#!/usr/bin/env node
// Downloads and compresses the site's real images from the live thesortingagent.com
// WordPress site into src/images/, so the static rebuild doesn't depend on the old
// site staying up. Run manually via the "Fetch site images" GitHub Action
// (Actions tab -> Fetch site images -> Run workflow) - not part of the normal build,
// since these images rarely change and there's no need to re-fetch them on every deploy.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, "image-manifest.json"), "utf8")
);
const outDir = path.join(__dirname, "..", "src", "images");
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const { file, url, maxWidth } of manifest) {
    process.stdout.write(`Fetching ${file} ... `);
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`SKIPPED (HTTP ${res.status})`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    totalBefore += buf.length;

    const ext = path.extname(file).toLowerCase();
    let pipeline = sharp(buf).resize({
      width: maxWidth,
      withoutEnlargement: true,
    });

    let out;
    if (ext === ".jpg" || ext === ".jpeg") {
      out = await pipeline.jpeg({ quality: 76, mozjpeg: true }).toBuffer();
    } else if (ext === ".png") {
      out = await pipeline
        .png({ quality: 76, compressionLevel: 9, palette: true })
        .toBuffer();
    } else if (ext === ".webp") {
      out = await pipeline.webp({ quality: 76 }).toBuffer();
    } else {
      out = await pipeline.toBuffer();
    }

    // Occasionally recompression makes a tiny/simple image bigger - keep the smaller one.
    const finalBuf = out.length < buf.length ? out : buf;
    totalAfter += finalBuf.length;

    fs.writeFileSync(path.join(outDir, file), finalBuf);
    console.log(
      `${(buf.length / 1024).toFixed(0)}KB -> ${(finalBuf.length / 1024).toFixed(0)}KB`
    );
  }

  console.log(
    `\nDone. Total ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB`
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
