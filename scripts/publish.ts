// changesets only publishes via npm, pnpm or yarn. npm would ship
// `workspace:` ranges verbatim, so publishing goes through `bun publish`.
// The "New tag:" lines are what changesets/action parses to report
// published packages to the Docker job.
import { $, Glob } from 'bun'
import path from 'node:path'

interface Manifest {
  name: string
  version: string
  private?: boolean
  workspaces?: readonly string[]
}

interface WorkspacePackage {
  dir: string
  manifest: Manifest
}

const REGISTRY = 'https://registry.npmjs.org'
const HTTP_NOT_FOUND = 404

const readManifest = (dir: string): Promise<Manifest> =>
  Bun.file(path.join(dir, 'package.json')).json() as Promise<Manifest>

async function findPublicPackages(root: string): Promise<WorkspacePackage[]> {
  const { workspaces = [] } = await readManifest(root)
  const dirs = new Set<string>()

  for (const pattern of workspaces) {
    for await (const file of new Glob(`${pattern}/package.json`).scan(root)) {
      dirs.add(path.join(root, path.dirname(file)))
    }
  }

  const packages = await Promise.all(
    Array.from(dirs, async (dir) => ({
      dir,
      manifest: await readManifest(dir),
    })),
  )
  return packages.filter(({ manifest }) => !manifest.private)
}

async function isPublished({ name, version }: Manifest): Promise<boolean> {
  const response = await fetch(`${REGISTRY}/${name}/${version}`)
  if (response.status === HTTP_NOT_FOUND) {
    return false
  }
  if (!response.ok) {
    throw new Error(`${name}@${version}: registry answered ${response.status}`)
  }
  return true
}

async function publishUnreleased(
  root: string,
  { dryRun = false } = {},
): Promise<void> {
  for (const { dir, manifest } of await findPublicPackages(root)) {
    if (await isPublished(manifest)) {
      continue
    }

    const tag = `${manifest.name}@${manifest.version}`
    if (dryRun) {
      await $`bun publish --dry-run`.cwd(dir)
    } else {
      await $`bun publish`.cwd(dir)
      // Tagging here instead of `changeset tag`: that would also tag
      // unpublished packages and print its own "New tag:" lines, which
      // changesets/action would turn into duplicate GitHub releases.
      await $`git tag ${tag}`.cwd(root)
    }
    process.stdout.write(`New tag: ${tag}\n`)
  }
}

if (import.meta.main) {
  await publishUnreleased(path.join(import.meta.dir, '..'), {
    dryRun: process.argv.includes('--dry-run'),
  })
}
