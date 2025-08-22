#!/usr/bin/env node

/**
 * Frontend Dependencies Installation Script
 *
 * This script installs all frontend dependencies in the correct order to avoid conflicts.
 * Run this script from the frontend directory.
 *
 * Usage:
 *     node install_dependencies.js
 *     or
 *     npm run install-deps (if added to package.json scripts)
 */

const { execSync } = require("node:child_process")
const fs = require("node:fs")
const path = require("node:path")

/**
 * Execute a command and handle errors
 * @param {string} command - Command to execute
 * @param {string} description - Description of what's being done
 * @returns {boolean} - Success status
 */
function runCommand(command, description) {
  console.log(`\n${"=".repeat(60)}`)
  console.log(`${description}...`)
  console.log(`${"=".repeat(60)}`)
  console.log(`Running: ${command}`)

  try {
    execSync(command, { stdio: "inherit" })
    console.log(`✅ Successfully completed: ${description}`)
    return true
  } catch (error) {
    console.error(`❌ Failed: ${description}`)
    console.error(`Error: ${error.message}`)
    return false
  }
}

/**
 * Check if package.json exists
 * @returns {boolean} - True if package.json exists
 */
function checkPackageJson() {
  const packageJsonPath = path.join(process.cwd(), "package.json")
  if (!fs.existsSync(packageJsonPath)) {
    console.error(
      "❌ package.json not found. Please run this script from the frontend directory.",
    )
    return false
  }
  return true
}

/**
 * Main installation function
 */
function main() {
  console.log("FBR Invoicing App - Frontend Dependencies Installation")
  console.log("=====================================================")

  // Check if we're in the right directory
  if (!checkPackageJson()) {
    process.exit(1)
  }

  // Installation steps
  const installationSteps = [
    {
      description: "Installing Core Dependencies",
      command: "npm install",
    },
    {
      description: "Installing React Table",
      command: "npm install @tanstack/react-table@^8.20.5",
    },
    {
      description: "Installing Date Picker",
      command: "npm install react-datepicker@^7.5.0",
    },
    // { description: "Installing File Upload", command: "npm install react-dropzone@^14.3.5" },
    {
      description: "Installing Form Validation",
      command: "npm install @hookform/resolvers@^3.10.0 zod@^3.24.1",
    },
    {
      description: "Installing Date Utilities",
      command: "npm install date-fns@^4.1.0",
    },
    // { description: "Installing UI Components", command: "npm install react-select@^5.8.3 react-number-format@^5.4.2" },
    // { description: "Installing File Processing", command: "npm install file-saver@^2.0.5 xlsx@^0.18.5" },
    // { description: "Installing PDF Generation", command: "npm install jspdf@^2.5.2 html2canvas@^1.4.1" },
    // { description: "Installing Type Definitions", command: "npm install --save-dev @types/file-saver@^2.0.7" },
  ]

  // Execute each installation step
  for (const step of installationSteps) {
    if (!runCommand(step.command, step.description)) {
      console.log(`\n❌ Installation failed at: ${step.description}`)
      process.exit(1)
    }
  }

  // Check for vulnerabilities
  console.log(`\n${"=".repeat(60)}`)
  console.log("Checking for vulnerabilities...")
  console.log(`${"=".repeat(60)}`)

  try {
    execSync("npm audit", { stdio: "inherit" })
  } catch (error) {
    console.log("\n⚠️  Some vulnerabilities found. You may want to run:")
    console.log("   npm audit fix")
    console.log("   or")
    console.log("   npm audit fix --force (use with caution)")
  }

  // Success message
  console.log(`\n${"=".repeat(60)}`)
  console.log("🎉 All frontend dependencies installed successfully!")
  console.log("You can now start the development server with:")
  console.log("npm run dev")
  console.log(`${"=".repeat(60)}`)
}

// Run the main function
if (require.main === module) {
  main()
}

module.exports = { runCommand, checkPackageJson, main }
