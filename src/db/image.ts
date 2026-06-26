import { createHash } from "crypto";
import { and, eq } from "drizzle-orm";
import * as tar from "tar";
import { PassThrough, Readable } from "stream";
import { db } from "./index.js";
import { directory, image } from "./schema.js";
import { hashDir, collectTree, type DirEntry, type FileEntry } from "./file.js";

type InnerFns = {
  // listFiles: () => Promise<{ id: number; name: string; mime_type: string }[]>;
  // listDirs: () => Promise<{ id: number; name: string }[]>;
  // recomputeHash: () => Promise<string>;
};

export async function access<T>(
  imageId: number,
  callback: (inner: InnerFns) => Promise<T>
): Promise<T> {
  const row = await db
    .select({ directory_id: image.directory_id, directory_checksum: image.directory_checksum })
    .from(image)
    .where(eq(image.id, imageId))
    .limit(1);

  if (!row[0]) throw new Error(`Image ${imageId} not found`);

  const { directory_id, directory_checksum } = row[0];
  const currentHash = await hashDir(directory_id);

  if (currentHash !== directory_checksum) {
    throw new Error(`Image ${imageId} checksum mismatch — directory has been modified`);
  }

  const inner: InnerFns = {
  };

  return callback(inner);
}


async function buildTar(dirName: string, dirs: DirEntry[], files: FileEntry[]): Promise<Buffer> {
  const pack = new tar.Pack();
  const chunks: Buffer[] = [];
  const out = new PassThrough();
  out.on("data", (chunk: Buffer) => chunks.push(chunk));

  pack.pipe(out);

  // root dir entry
  pack.add(new tar.ReadEntry(new tar.Header({ path: `${dirName}/`, type: "Directory", size: 0 })));

  for (const d of dirs) {
    pack.add(new tar.ReadEntry(new tar.Header({ path: `${d.path}/`, type: "Directory", size: 0 })));
  }

  for (const f of files) {
    const readable = Readable.from(f.content);
    pack.add(new tar.ReadEntry(new tar.Header({ path: f.path, type: "File", size: f.content.length }), readable as any));
  }

  pack.end();

  await new Promise<void>((resolve, reject) => out.on("finish", resolve).on("error", reject));
  return Buffer.concat(chunks);
}

export async function getOrCreateImage(directoryId: number): Promise<{
  id: number
  directory_checksum: string
  tar_checksum: string
  tar_bytes: Buffer | null
}> {
  const directory_checksum = await hashDir(directoryId)
  const [existing] = await db
    .select({
      id: image.id,
      directory_checksum: image.directory_checksum,
      tar_checksum: image.tar_checksum,
      tar_bytes: image.tar_bytes,
    })
    .from(image)
    .where(and(
      eq(image.directory_id, directoryId),
      eq(image.directory_checksum, directory_checksum),
    ))
    .limit(1)

  if (existing?.tar_bytes) {
    return {
      id: existing.id,
      directory_checksum: existing.directory_checksum!,
      tar_checksum: existing.tar_checksum!,
      tar_bytes: existing.tar_bytes,
    }
  }

  const id = await createImage(directoryId)
  const [row] = await db
    .select({
      id: image.id,
      directory_checksum: image.directory_checksum,
      tar_checksum: image.tar_checksum,
      tar_bytes: image.tar_bytes,
    })
    .from(image)
    .where(eq(image.id, id))
    .limit(1)

  if (!row?.tar_bytes) {
    throw new Error(`Image ${id} was created without tar bytes`)
  }

  return {
    id: row.id,
    directory_checksum: row.directory_checksum!,
    tar_checksum: row.tar_checksum!,
    tar_bytes: row.tar_bytes,
  }
}

export async function createImage(directoryId: number): Promise<number> {
  const dirRow = await db
    .select({ name: directory.name })
    .from(directory)
    .where(eq(directory.id, directoryId))
    .limit(1);

  if (!dirRow[0]) throw new Error(`Directory ${directoryId} not found`);

  const dirName = dirRow[0].name;
  const directory_checksum = await hashDir(directoryId);
  const { dirs, files } = await collectTree(directoryId, dirName);
  const tar_bytes = await buildTar(dirName, dirs, files);
  const tar_checksum = createHash("sha1").update(tar_bytes).digest("hex");

  const [row] = await db
    .insert(image)
    .values({ directory_id: directoryId, directory_checksum, tar_checksum, tar_bytes })
    .returning({ id: image.id });

  return row.id;
}
