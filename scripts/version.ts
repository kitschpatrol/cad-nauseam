/* eslint-disable unicorn/no-null */
/* eslint-disable ts/no-restricted-types */

import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

type GitInfo = {
	branch: null | string
	commit: null | string
	commitDate: null | string
	tag: null | string
}

async function getGitInfo(): Promise<GitInfo> {
	const info: GitInfo = { branch: null, commit: null, commitDate: null, tag: null }

	const run = async (args: string[]): Promise<null | string> => {
		try {
			const { stdout } = await execFileAsync('git', args)
			return stdout.trim()
		} catch {
			return null
		}
	}

	info.tag = await run(['describe', '--tags', '--abbrev=0'])
	info.commit = await run(['rev-parse', '--short', 'HEAD'])
	info.branch = await run(['rev-parse', '--abbrev-ref', 'HEAD'])

	const rawDate = await run(['log', '-1', '--format=%cI'])
	if (rawDate) {
		info.commitDate = new Date(rawDate).toISOString()
	}

	return info
}

type PackageInfo = {
	name: null | string
	version: null | string
}

async function readPackageUp(startDirectory: string): Promise<null | Record<string, unknown>> {
	let directory = startDirectory
	// eslint-disable-next-line ts/no-unnecessary-condition
	while (true) {
		try {
			const pkgPath = join(directory, 'package.json')
			const contents = await readFile(pkgPath, 'utf8')
			// eslint-disable-next-line ts/no-unsafe-return
			return JSON.parse(contents)
		} catch {
			const parent = dirname(directory)
			if (parent === directory) {
				return null
			}
			directory = parent
		}
	}
}

function parsePrerelease(version: null | string | undefined): string[] {
	if (!version) {
		return []
	}
	// E.g. "1.2.3-beta.1" → ["beta", "1"]
	const hyphen = version.indexOf('-')
	if (hyphen === -1) {
		return []
	}
	return version.slice(hyphen + 1).split('.')
}

async function getPackageInfo(): Promise<PackageInfo> {
	const pkg = await readPackageUp(process.cwd())
	return {
		// eslint-disable-next-line ts/no-unnecessary-condition, ts/no-unsafe-type-assertion
		name: (pkg?.name as string) ?? null,
		// eslint-disable-next-line ts/no-unnecessary-condition, ts/no-unsafe-type-assertion
		version: (pkg?.version as string) ?? null,
	}
}

const packageInfo = await getPackageInfo()
const prerelease = parsePrerelease(packageInfo.version)

const versionJson = {
	date: new Date().toISOString(),
	deployment: prerelease.length === 0 ? 'main' : 'preview',
	git: await getGitInfo(),
	package: packageInfo,
}

console.log(JSON.stringify(versionJson, undefined, 2))
