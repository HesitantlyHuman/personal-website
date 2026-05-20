import React from "react";
import fs from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;

const root = process.cwd();

async function readAsset(relativePath: string) {
    return fs.readFile(path.join(root, relativePath));
}

function toDataUrl(buffer: Buffer, mimeType: string) {
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function main() {
    const regularFont = await readAsset("public/fonts/atkinson-regular.woff");
    const boldFont = await readAsset("public/fonts/atkinson-bold.woff");

    const background = await readAsset("src/assets/og/open-graph-template.png");
    const backgroundSrc = toDataUrl(background, "image/png");

    const title = "AutoClip for PyTorch";
    const summary =
        "A drop-in adaptive gradient clipping package for PyTorch, extending AutoClip with optimizer wrappers, local and global clipping, configurable history, and checkpointing.";

    const svg = await satori(
        <div
            style={{
                width: WIDTH,
                height: HEIGHT,
                display: "flex",
                position: "relative",
                fontFamily: "Atkinson Hyperlegible",
            }}
        >
            <img
                src={backgroundSrc}
                width={WIDTH}
                height={HEIGHT}
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: WIDTH,
                    height: HEIGHT,
                }}
            />

            <div
                style={{
                    position: "absolute",
                    left: 112,
                    top: 92,
                    width: 980,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        color: "white",
                        fontSize: 62,
                        lineHeight: 1.05,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                    }}
                >
                    {title}
                </div>

                <div
                    style={{
                        marginTop: 34,
                        color: "rgba(255, 255, 255, 0.78)",
                        fontSize: 30,
                        lineHeight: 1.35,
                        fontWeight: 400,
                        width: 980,
                    }}
                >
                    {summary}
                </div>
            </div>
        </div>,
        {
            width: WIDTH,
            height: HEIGHT,
            fonts: [
                {
                    name: "Atkinson Hyperlegible",
                    data: regularFont,
                    weight: 400,
                    style: "normal",
                },
                {
                    name: "Atkinson Hyperlegible",
                    data: boldFont,
                    weight: 700,
                    style: "normal",
                },
            ],
        },
    );

    const outputDir = path.join(root, "public", "og");
    const outputPath = path.join(outputDir, "test.png");

    await fs.mkdir(outputDir, { recursive: true });
    await sharp(Buffer.from(svg)).png().toFile(outputPath);

    console.log(`Generated ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});