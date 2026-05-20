import React from "react";
import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import sharp from "sharp";
import matter from "gray-matter";

import { SITE, BLOG, PROJECTS, SEARCH, WORK } from "../src/consts";

const WIDTH = 1200;
const HEIGHT = 630;

const root = process.cwd();

type CollectionName = "blog" | "projects";

type OgPage = {
    outputPath: string;
    title: string;
    summary: string;
};

type ContentEntry = {
    collection: CollectionName;
    slug: string;
    title: string;
    summary: string;
};

const staticPages: OgPage[] = [
    {
        outputPath: "public/og/index.png",
        title: SITE.TITLE,
        summary: SITE.DESCRIPTION,
    },
    {
        outputPath: "public/og/blog.png",
        title: BLOG.TITLE,
        summary: BLOG.DESCRIPTION,
    },
    {
        outputPath: "public/og/projects.png",
        title: PROJECTS.TITLE,
        summary: PROJECTS.DESCRIPTION,
    },
    {
        outputPath: "public/og/search.png",
        title: SEARCH.TITLE,
        summary: SEARCH.DESCRIPTION,
    },
    {
        outputPath: "public/og/work.png",
        title: WORK.TITLE,
        summary: WORK.DESCRIPTION,
    },
];

async function readAsset(relativePath: string): Promise<Buffer> {
    return fs.readFile(path.join(root, relativePath));
}

function toDataUrl(buffer: Buffer, mimeType: string): string {
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function* walkFiles(dir: string): AsyncGenerator<string> {
    let entries: Dirent[];

    try {
        entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return;
        }

        throw error;
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            yield* walkFiles(fullPath);
        } else if (entry.isFile()) {
            yield fullPath;
        }
    }
}

function getContentSlug(collectionDir: string, filePath: string): string {
    const relativePath = path.relative(collectionDir, filePath);
    const parsed = path.parse(relativePath);

    // Handles:
    // src/content/blog/my-post/index.mdx -> my-post
    if (parsed.name === "index") {
        return slugify(path.dirname(relativePath));
    }

    // Handles:
    // src/content/blog/my-post.mdx -> my-post
    return slugify(path.join(parsed.dir, parsed.name));
}

async function readCollection(collection: CollectionName): Promise<ContentEntry[]> {
    const collectionDir = path.join(root, "src", "content", collection);
    const entries: ContentEntry[] = [];

    for await (const filePath of walkFiles(collectionDir)) {
        if (!filePath.endsWith(".md") && !filePath.endsWith(".mdx")) {
            continue;
        }

        const raw = await fs.readFile(filePath, "utf8");
        const { data } = matter(raw);

        if (data.draft) {
            continue;
        }

        if (typeof data.title !== "string") {
            console.warn(`Skipping ${path.relative(root, filePath)}: missing title`);
            continue;
        }

        if (typeof data.summary !== "string") {
            console.warn(`Skipping ${path.relative(root, filePath)}: missing summary`);
            continue;
        }

        entries.push({
            collection,
            slug: getContentSlug(collectionDir, filePath),
            title: data.title,
            summary: data.summary,
        });
    }

    return entries;
}

function clampText(input: string, maxLength: number): string {
    const normalized = input.replace(/\s+/g, " ").trim();

    if (normalized.length <= maxLength) {
        return normalized;
    }

    const trimmed = normalized.slice(0, maxLength - 1);
    const lastSpace = trimmed.lastIndexOf(" ");

    if (lastSpace < maxLength * 0.65) {
        return `${trimmed}…`;
    }

    return `${trimmed.slice(0, lastSpace)}…`;
}

async function generateOgImage({
    title,
    summary,
    backgroundSrc,
    regularFont,
    boldFont,
}: {
    title: string;
    summary: string;
    backgroundSrc: string;
    regularFont: Buffer;
    boldFont: Buffer;
}): Promise<Buffer> {
    const safeTitle = clampText(title, 92);
    const safeSummary = clampText(summary, 190);

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
                    {safeTitle}
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
                    {safeSummary}
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

    return sharp(Buffer.from(svg)).png().toBuffer();
}

async function writeOgImage({
    page,
    backgroundSrc,
    regularFont,
    boldFont,
}: {
    page: OgPage;
    backgroundSrc: string;
    regularFont: Buffer;
    boldFont: Buffer;
}) {
    const image = await generateOgImage({
        title: page.title,
        summary: page.summary,
        backgroundSrc,
        regularFont,
        boldFont,
    });

    const absoluteOutputPath = path.join(root, page.outputPath);
    await fs.mkdir(path.dirname(absoluteOutputPath), { recursive: true });
    await fs.writeFile(absoluteOutputPath, image);

    console.log(`Generated ${path.relative(root, absoluteOutputPath)}`);
}

async function main() {
    const regularFont = await readAsset("public/fonts/atkinson-regular.woff");
    const boldFont = await readAsset("public/fonts/atkinson-bold.woff");

    const background = await readAsset("src/assets/og/open-graph-template.png");
    const backgroundSrc = toDataUrl(background, "image/png");

    const contentEntries = [
        ...(await readCollection("blog")),
        ...(await readCollection("projects")),
    ];

    const contentPages: OgPage[] = contentEntries.map((entry) => ({
        outputPath: `public/og/${entry.collection}/${entry.slug}.png`,
        title: entry.title,
        summary: entry.summary,
    }));

    const pages = [...staticPages, ...contentPages];

    await fs.rm(path.join(root, "public", "og"), {
        recursive: true,
        force: true,
    });

    for (const page of pages) {
        await writeOgImage({
            page,
            backgroundSrc,
            regularFont,
            boldFont,
        });
    }

    console.log(`Done. Generated ${pages.length} Open Graph images.`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});