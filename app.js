#!/usr/bin/env node

const { exec } = require('child_process')
const [dir, script, isWindows = true, time_inteval = 3] = process.argv.slice(2)
const chokidar = require('chokidar');

console.log(isWindows);

let proc = undefined
let id

if (dir === "help") {
    helpMessage()
    process.exit()
}

launchScript(true)

const watcher = chokidar.watch(dir, { ignored: /(^|[\/\\])\../, ignoreInitial: true })
    .on('all', (path, stats) => {
        if (id)
            clearTimeout(id)
        id = setTimeout(launchScript, time_inteval * 1000)
    });

function fileChangeMessage() {
    console.log('==========================================')
    console.log('       Some files has been changed')
    console.log('==========================================')
}

function beginStart() {
    console.log('==========================================')
    console.log('             Start script...')
    console.log('==========================================')
}

function helpMessage() {
    console.log("Watcher > watcher <directory to check in absolute> <script to launch> [put true if windows os] [time interval in seconds].")
    console.log("Watcher > <> = required, [] = optional.")
}

function launchScript(isBegin) {
    isBegin ? beginStart() : fileChangeMessage()
    if (proc)
        proc.kill('SIGINT')
    proc = exec((!isWindows ? 'sh ' : '') + script, function (error, stdout, stderr) {
        console.log(' \n' + stdout)
        if (error !== null) {
            console.log('Error: ' + error)
        }
    })
}

