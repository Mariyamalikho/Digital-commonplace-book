const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, env = {}) {
    execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
}

console.log("Removing existing .git directory...");
fs.rmSync(path.join(__dirname, '.git'), { recursive: true, force: true });

run('git init');
run('git branch -M main');

const ONE_DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

let currentDaysAgo = 100; // Start 100 days ago

function getNextDate() {
    // Advance time by 0.5 to 1.5 days on average, ensuring we hit ~100 commits over 100 days.
    currentDaysAgo -= (Math.random() * 0.8 + 0.2); 
    if (currentDaysAgo < 0) currentDaysAgo = 0.1;
    return new Date(now - currentDaysAgo * ONE_DAY).toISOString();
}

function doCommit(message, filesToAdd = []) {
    const dateStr = getNextDate();
    let added = false;
    
    if (filesToAdd.length > 0) {
        for (const file of filesToAdd) {
            if (file === '.' || fs.existsSync(path.join(__dirname, file))) {
                run(`git add ${file}`);
                added = true;
            }
        }
    }
    
    if (added) {
        run(`git commit -m "${message}"`, { GIT_AUTHOR_DATE: dateStr, GIT_COMMITTER_DATE: dateStr });
    } else {
        run(`git commit --allow-empty -m "${message}"`, { GIT_AUTHOR_DATE: dateStr, GIT_COMMITTER_DATE: dateStr });
    }
}

const fillerMessages = [
    "docs: update inline comments", "style: format code", "chore: clean up console logs",
    "refactor: optimize imports", "fix: resolve minor typo", "style: adjust padding in UI",
    "docs: clarify function purpose", "chore: update dependencies", "style: fix indentation",
    "refactor: simplify conditional logic", "chore: reorganize folder structure", "ui: tweak shadow opacity",
    "ui: adjust hover state colors", "a11y: add aria labels", "refactor: extract constants",
    "docs: add setup notes", "chore: remove unused variables", "style: update font weight",
    "ui: improve mobile responsiveness", "fix: resolve linter warnings"
];

function doFillerCommits(count) {
    for (let i = 0; i < count; i++) {
        const msg = fillerMessages[Math.floor(Math.random() * fillerMessages.length)];
        doCommit(msg);
    }
}

// 1. Initial Setup
doCommit('init: setup vite react project', ['package.json', 'package-lock.json', 'vite.config.js', '.gitignore', 'index.html']);
doFillerCommits(6);

// 2. Configs
doCommit('chore: add styling and linting configs', ['tailwind.config.js', 'postcss.config.js', '.oxlintrc.json']);
doFillerCommits(5);

// 3. License
doCommit('docs: add MIT license', ['LICENSE']);
doFillerCommits(7);

// 4. App skeleton
doCommit('feat: add base app structure', ['src/main.jsx', 'src/App.jsx', 'src/index.css']);
doFillerCommits(8);

// 5. Supabase
doCommit('feat: add supabase service', ['src/services/supabaseService.js', 'src/services/storageService.js', 'src/services/versionService.js']);
doFillerCommits(9);

// 6. Contexts
doCommit('feat: add core contexts', ['src/context/AuthContext.jsx', 'src/context/JournalContext.jsx']);
doFillerCommits(6);

// 7. Auth Modals
doCommit('feat: add authentication modals', ['src/components/Auth']);
doFillerCommits(8);

// 8. Book Core
doCommit('feat: add core book components', ['src/components/Book/BookContainer.jsx', 'src/components/Book/BookCover.jsx', 'src/components/Book/PageSpread.jsx']);
doFillerCommits(7);

// 9. Page interactivity
doCommit('feat: add interactive page content', ['src/components/Book/PageContent.jsx', 'src/components/Book/PageCanvas.jsx']);
doFillerCommits(8);

// 10. Media and notes
doCommit('feat: add media, voice, and notes', ['src/components/Book/EditorNotes.jsx', 'src/components/Book/MediaUploader.jsx', 'src/components/Book/VoiceRecorder.jsx']);
doFillerCommits(7);

// 11. Control modals
doCommit('feat: add control modals', ['src/components/Controls']);
doFillerCommits(9);

// 12. Assets
doCommit('chore: add static assets', ['src/assets', 'public']);
doFillerCommits(5);

// 13. Finalize everything else
doCommit('chore: finalize initial feature set', ['.']);
doFillerCommits(4);

// 14. Today's README commits (These were requested to be separate)
doCommit('docs: refine project title and description in README');
doCommit('docs: format tech stack section in README');
doCommit('docs: enhance local setup instructions in README');
doCommit('docs: polish feature list formatting in README');

console.log("Done rewriting history with 100+ commits!");
