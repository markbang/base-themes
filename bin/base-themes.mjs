#!/usr/bin/env node
import { createDoctorReport, createRegistryAdd, createRegistryPlan, formatDoctorReport, formatRegistryAdd, formatRegistryList, formatRegistryPlan, loadRegistry } from '../scripts/registry-plan.mjs'

const [command, ...args] = process.argv.slice(2)
const registry = loadRegistry(new URL('../registry/registry.json', import.meta.url))

function printHelp() {
  console.log(`Base Themes CLI

Usage:
  base-themes list [--json]
  base-themes plan <component...> [block:<block-name>...] [theme:<style>...] [--json]
  base-themes add <component...> [block:<block-name>...] [theme:<style>...] [--target <dir>] [--dry-run] [--force] [--json]
  base-themes doctor [project-root] [--json]

Examples:
  base-themes list
  base-themes list --json
  base-themes plan button select block:dashboard-shell theme:enterprise
  base-themes plan button select block:dashboard-shell theme:enterprise --json
  base-themes add button select block:dashboard-shell theme:enterprise --target . --dry-run
  base-themes doctor . --json
`)
}

function parseRegistryArgs(args) {
  const requested = []
  const options = {}

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }
    if (arg === '--force') {
      options.force = true
      continue
    }
    if (arg === '--json') {
      options.json = true
      continue
    }
    if (arg === '--target') {
      const target = args[index + 1]
      if (!target) throw new Error('Missing value for --target')
      options.target = target
      index += 1
      continue
    }
    if (arg.startsWith('--target=')) {
      options.target = arg.slice('--target='.length)
      continue
    }
    if (arg.startsWith('--')) throw new Error(`Unknown add option: ${arg}`)
    requested.push(arg)
  }

  return { requested, options }
}

function printResult(value, json, formatter) {
  console.log(json ? JSON.stringify(value, null, 2) : formatter(value))
}

if (!command || command === 'help' || command === '--help' || command === '-h') {
  printHelp()
  process.exit(0)
}

if (command === 'list') {
  const json = args.includes('--json')
  const unknownArgs = args.filter((arg) => arg !== '--json')
  if (unknownArgs.length > 0) {
    console.error(`Unknown list option: ${unknownArgs[0]}`)
    console.error('Usage: base-themes list [--json]')
    process.exit(1)
  }
  printResult(registry, json, formatRegistryList)
  process.exit(0)
}

if (command === 'plan') {
  let parsed
  try {
    parsed = parseRegistryArgs(args)
  } catch (error) {
    console.error(error.message)
    console.error('Usage: base-themes plan <component...> [block:<block-name>...] [theme:<style>...] [--json]')
    process.exit(1)
  }

  if (parsed.requested.length === 0) {
    console.error('Usage: base-themes plan <component...> [block:<block-name>...] [theme:<style>...] [--json]')
    process.exit(1)
  }

  const plan = createRegistryPlan(registry, parsed.requested)
  printResult(plan, parsed.options.json, formatRegistryPlan)
  process.exit(plan.ok ? 0 : 1)
}

if (command === 'add') {
  let parsed
  try {
    parsed = parseRegistryArgs(args)
  } catch (error) {
    console.error(error.message)
    console.error('Usage: base-themes add <component...> [block:<block-name>...] [theme:<style>...] [--target <dir>] [--dry-run] [--force] [--json]')
    process.exit(1)
  }

  if (parsed.requested.length === 0) {
    console.error('Usage: base-themes add <component...> [block:<block-name>...] [theme:<style>...] [--target <dir>] [--dry-run] [--force] [--json]')
    process.exit(1)
  }

  const result = createRegistryAdd(registry, parsed.requested, parsed.options)
  printResult(result, parsed.options.json, formatRegistryAdd)
  process.exit(result.ok ? 0 : 1)
}

if (command === 'doctor') {
  const json = args.includes('--json')
  const positional = args.filter((arg) => arg !== '--json')
  if (positional.some((arg) => arg.startsWith('--'))) {
    console.error(`Unknown doctor option: ${positional.find((arg) => arg.startsWith('--'))}`)
    console.error('Usage: base-themes doctor [project-root] [--json]')
    process.exit(1)
  }
  if (positional.length > 1) {
    console.error('Usage: base-themes doctor [project-root] [--json]')
    process.exit(1)
  }
  const root = positional[0] ?? process.cwd()
  const report = createDoctorReport(root)
  printResult(report, json, formatDoctorReport)
  process.exit(report.ok ? 0 : 1)
}

console.error(`Unknown command: ${command}`)
printHelp()
process.exit(1)
