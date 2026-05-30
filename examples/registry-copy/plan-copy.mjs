#!/usr/bin/env node
import { createDoctorReport, createRegistryAdd, createRegistryPlan, formatDoctorReport, formatRegistryAdd, formatRegistryList, formatRegistryPlan, loadRegistry } from '../../scripts/registry-plan.mjs'

const registry = loadRegistry()
const [maybeCommand, ...rest] = process.argv.slice(2)

function printHelp() {
  console.log(`Registry Copy Example

Usage:
  node examples/registry-copy/plan-copy.mjs list [--json]
  node examples/registry-copy/plan-copy.mjs plan <component...> [block:<block-name>...] [theme:<style>...] [--json]
  node examples/registry-copy/plan-copy.mjs add <component...> [block:<block-name>...] [theme:<style>...] [--target <dir>] [--dry-run] [--force] [--json]
  node examples/registry-copy/plan-copy.mjs doctor [project-root] [--json]

Backwards-compatible shorthand:
  node examples/registry-copy/plan-copy.mjs <component...> [block:<block-name>...] [theme:<style>...] [--json]

Examples:
  node examples/registry-copy/plan-copy.mjs button select block:dashboard-shell theme:enterprise
  node examples/registry-copy/plan-copy.mjs plan button select block:dashboard-shell theme:enterprise --json
  node examples/registry-copy/plan-copy.mjs add button select block:dashboard-shell theme:enterprise --target . --dry-run
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
    if (arg.startsWith('--')) throw new Error(`Unknown registry-copy option: ${arg}`)
    requested.push(arg)
  }

  return { requested, options }
}

function printResult(value, json, formatter) {
  console.log(json ? JSON.stringify(value, null, 2) : formatter(value))
}

function failWithUsage(message, usage) {
  if (message) console.error(message)
  console.error(usage)
  process.exit(1)
}

if (!maybeCommand || maybeCommand === 'help' || maybeCommand === '--help' || maybeCommand === '-h') {
  printHelp()
  process.exit(0)
}

const knownCommands = new Set(['list', 'plan', 'add', 'doctor'])
const command = knownCommands.has(maybeCommand) ? maybeCommand : 'plan'
const args = command === 'plan' && !knownCommands.has(maybeCommand) ? [maybeCommand, ...rest] : rest

if (command === 'list') {
  const json = args.includes('--json')
  const unknownArgs = args.filter((arg) => arg !== '--json')
  if (unknownArgs.length > 0) failWithUsage(`Unknown list option: ${unknownArgs[0]}`, 'Usage: node examples/registry-copy/plan-copy.mjs list [--json]')
  printResult(registry, json, formatRegistryList)
  process.exit(0)
}

if (command === 'plan') {
  let parsed
  try {
    parsed = parseRegistryArgs(args)
  } catch (error) {
    failWithUsage(error.message, 'Usage: node examples/registry-copy/plan-copy.mjs plan <component...> [block:<block-name>...] [theme:<style>...] [--json]')
  }

  if (parsed.requested.length === 0) failWithUsage(undefined, 'Usage: node examples/registry-copy/plan-copy.mjs plan <component...> [block:<block-name>...] [theme:<style>...] [--json]')

  const plan = createRegistryPlan(registry, parsed.requested)
  printResult(plan, parsed.options.json, formatRegistryPlan)
  process.exit(plan.ok ? 0 : 1)
}

if (command === 'add') {
  let parsed
  try {
    parsed = parseRegistryArgs(args)
  } catch (error) {
    failWithUsage(error.message, 'Usage: node examples/registry-copy/plan-copy.mjs add <component...> [block:<block-name>...] [theme:<style>...] [--target <dir>] [--dry-run] [--force] [--json]')
  }

  if (parsed.requested.length === 0) failWithUsage(undefined, 'Usage: node examples/registry-copy/plan-copy.mjs add <component...> [block:<block-name>...] [theme:<style>...] [--target <dir>] [--dry-run] [--force] [--json]')

  const result = createRegistryAdd(registry, parsed.requested, parsed.options)
  printResult(result, parsed.options.json, formatRegistryAdd)
  process.exit(result.ok ? 0 : 1)
}

if (command === 'doctor') {
  const json = args.includes('--json')
  const positional = args.filter((arg) => arg !== '--json')
  if (positional.some((arg) => arg.startsWith('--'))) failWithUsage(`Unknown doctor option: ${positional.find((arg) => arg.startsWith('--'))}`, 'Usage: node examples/registry-copy/plan-copy.mjs doctor [project-root] [--json]')
  if (positional.length > 1) failWithUsage(undefined, 'Usage: node examples/registry-copy/plan-copy.mjs doctor [project-root] [--json]')
  const root = positional[0] ?? process.cwd()
  const report = createDoctorReport(root)
  printResult(report, json, formatDoctorReport)
  process.exit(report.ok ? 0 : 1)
}

failWithUsage(`Unknown command: ${command}`, 'Usage: node examples/registry-copy/plan-copy.mjs help')
