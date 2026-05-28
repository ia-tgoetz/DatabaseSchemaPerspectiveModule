param (
    [Parameter(Mandatory=$true)]
    [string]$SkillName
)

$SkillsDir = Join-Path $PSScriptRoot ".."
$NewSkillDir = Join-Path $SkillsDir $SkillName

if (Test-Path $NewSkillDir) {
    Write-Error "Skill '$SkillName' already exists at $NewSkillDir"
    exit 1
}

New-Item -ItemType Directory -Path $NewSkillDir | Out-Null

$Template = @"
# Skill: $SkillName
[Brief description of the skill's expertise]

## Goal
[What the skill aims to achieve]

## Core Mandates
- [Mandate 1]
- [Mandate 2]

## Workflow
1. [Step 1]
2. [Step 2]

## Operational Patterns / Best Practices
- [Pattern 1]
- [Pattern 2]

## Available Resources
- [Resource 1]
"@

$SkillPath = Join-Path $NewSkillDir "SKILL.md"
$Template | Out-File -FilePath $SkillPath -Encoding utf8

Write-Host "Created skill '$SkillName' at $NewSkillDir"
Write-Host "Please update $SkillPath and add to the registry."
