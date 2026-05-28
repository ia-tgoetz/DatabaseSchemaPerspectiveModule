param (
    [Parameter(Mandatory=$true)]
    [string]$branchDescription,
    
    [Parameter(Mandatory=$true)]
    [string]$commitMessage
)

# Get git user name to derive the username prefix
$fullName = git config user.name
if (-not $fullName) {
    Write-Error "Git user.name not configured. Please set it using 'git config user.name \"Your Name\"'"
    exit 1
}

# Derive username: firstInitial + LastName (all lowercase)
$parts = $fullName.Trim().Split(" ")
if ($parts.Length -ge 2) {
    $firstInitial = $parts[0].Substring(0, 1).ToLower()
    $lastName = $parts[-1].ToLower()
    $derivedUsername = "${firstInitial}${lastName}"
} else {
    $derivedUsername = $fullName.ToLower().Replace(" ", "")
}

# Normalize branch description: lowercase, hyphens instead of spaces
$normalizedDescription = $branchDescription.ToLower().Replace(" ", "-")
$expectedBranch = "${derivedUsername}/${normalizedDescription}"

# Get current branch
$currentBranch = git rev-parse --abbrev-ref HEAD

if ($currentBranch -ne $expectedBranch) {
    # Check if a branch containing the description already exists
    $existingBranches = git branch --list "*${normalizedDescription}*"
    
    if ($existingBranches) {
        # If there's an existing branch with this description, just switch to it (if not already on it)
        $firstMatch = ($existingBranches[0].Trim() -replace '^\*', '').Trim()
        if ($currentBranch -ne $firstMatch) {
            Write-Host "Switching to existing branch: $firstMatch"
            git checkout $firstMatch
        }
    } else {
        # Create and checkout new branch
        Write-Host "Creating new branch: $expectedBranch"
        git checkout -b $expectedBranch
    }
} else {
    Write-Host "Already on branch: $currentBranch"
}

# Add all changes
Write-Host "Adding changes..."
git add .

# Commit
Write-Host "Committing changes..."
git commit -m $commitMessage

Write-Host "Done."
