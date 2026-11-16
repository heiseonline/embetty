// changesets only publishes via npm, pnpm or yarn. npm would ship
// `workspace:` ranges verbatim, so publishing goes through `bun publish`.
// changesets/action reads the published packages from the file named by
// CHANGESETS_OUTPUT, then pushes their tags, creates the GitHub releases and
// reports them to the Docker job.
import { $, Glob } from 'bun'
import { appendFile } from 'node:fs/promises'
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
      continue
    }

    await $`bun publish`.cwd(dir)
    await reportTag(tag, manifest.name)
  }
}

interface GitTagEvent {
  type: 'git-tag'
  tag: string
  packageName: string
}

async function reportTag(tag: string, packageName: string): Promise<void> {
  const output = process.env.CHANGESETS_OUTPUT
  if (!output) {
    // Outside the action, tag locally like `changeset publish` does.
    await $`git tag ${tag}`
    return
  }

  const event: GitTagEvent = { type: 'git-tag', tag, packageName }
  await appendFile(output, `${JSON.stringify(event)}\n`)
}

if (import.meta.main) {
  await publishUnreleased(path.join(import.meta.dir, '..'), {
    dryRun: process.argv.includes('--dry-run'),
  })
}
