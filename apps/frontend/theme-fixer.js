const fs = require("fs");
const path = require("path");

const DIRECTORIES = ["app", "components"];
const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

const REPLACEMENTS = [
  // Text colors
  { regex: /\btext-slate-900\b/g, replacement: "text-foreground" },
  { regex: /\btext-slate-800\b/g, replacement: "text-foreground" },
  { regex: /\btext-slate-700\b/g, replacement: "text-foreground" },
  { regex: /\btext-slate-600\b/g, replacement: "text-muted-foreground" },
  { regex: /\btext-slate-500\b/g, replacement: "text-muted-foreground" },
  { regex: /\btext-slate-400\b/g, replacement: "text-muted-foreground" },
  { regex: /\btext-gray-900\b/g, replacement: "text-foreground" },
  { regex: /\btext-gray-800\b/g, replacement: "text-foreground" },
  { regex: /\btext-gray-700\b/g, replacement: "text-foreground" },
  { regex: /\btext-gray-600\b/g, replacement: "text-muted-foreground" },
  { regex: /\btext-gray-500\b/g, replacement: "text-muted-foreground" },
  { regex: /\btext-gray-400\b/g, replacement: "text-muted-foreground" },
  { regex: /\btext-zinc-900\b/g, replacement: "text-foreground" },
  { regex: /\btext-zinc-800\b/g, replacement: "text-foreground" },
  { regex: /\btext-zinc-700\b/g, replacement: "text-foreground" },
  { regex: /\btext-zinc-600\b/g, replacement: "text-muted-foreground" },
  { regex: /\btext-zinc-500\b/g, replacement: "text-muted-foreground" },
  { regex: /\btext-black\b/g, replacement: "text-foreground" },

  // Background colors
  { regex: /\bbg-white\b/g, replacement: "bg-background" },
  { regex: /\bbg-slate-50\b/g, replacement: "bg-muted" },
  { regex: /\bbg-slate-100\b/g, replacement: "bg-muted" },
  { regex: /\bbg-slate-200\b/g, replacement: "bg-accent" },
  { regex: /\bbg-gray-50\b/g, replacement: "bg-muted" },
  { regex: /\bbg-gray-100\b/g, replacement: "bg-muted" },
  { regex: /\bbg-gray-200\b/g, replacement: "bg-accent" },
  { regex: /\bbg-zinc-50\b/g, replacement: "bg-muted" },
  { regex: /\bbg-zinc-100\b/g, replacement: "bg-muted" },
  { regex: /\bbg-zinc-200\b/g, replacement: "bg-accent" },

  // Border colors
  { regex: /\bborder-slate-100\b/g, replacement: "border-border" },
  { regex: /\bborder-slate-200\b/g, replacement: "border-border" },
  { regex: /\bborder-slate-300\b/g, replacement: "border-input" },
  { regex: /\bborder-gray-100\b/g, replacement: "border-border" },
  { regex: /\bborder-gray-200\b/g, replacement: "border-border" },
  { regex: /\bborder-gray-300\b/g, replacement: "border-input" },
  { regex: /\bborder-zinc-100\b/g, replacement: "border-border" },
  { regex: /\bborder-zinc-200\b/g, replacement: "border-border" },
  { regex: /\bborder-zinc-300\b/g, replacement: "border-input" },

  // Transparent/Opacity variants (handle specific cases)
  { regex: /\bborder-black\/10\b/g, replacement: "border-border" },
  { regex: /\bborder-black\/5\b/g, replacement: "border-border" },
];

let changedFilesCount = 0;

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        processDirectory(fullPath);
      }
    } else if (
      entry.isFile() &&
      EXTENSIONS.includes(path.extname(entry.name))
    ) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  let newContent = content;
  let modified = false;

  for (const r of REPLACEMENTS) {
    if (r.regex.test(newContent)) {
      newContent = newContent.replace(r.regex, r.replacement);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, newContent, "utf-8");
    console.log(`Updated: ${filePath}`);
    changedFilesCount++;
  }
}

for (const dir of DIRECTORIES) {
  const fullDirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullDirPath)) {
    processDirectory(fullDirPath);
  }
}

console.log(`Done. Modified ${changedFilesCount} files.`);
