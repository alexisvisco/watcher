#!/usr/bin/env node

const watch = require('node-watch')
const exec = require('child_process').exec

const TIME_INTERVAL = 5
const TIME_CHECK = 5000

let proc
let dir
let script
let isWindows = false

let lastChanged = 0
let upToDate = true

process.argv.forEach(function (val, index, array) {
    if (index == 2 && val === "help") {
        helpMessage()
        process.exit()
    }
    if (index == 2)
        dir = val
    if (index == 3)
        script = val
    if (index == 4)
        isWindows = true;
    console.log(index + " : " + val)
});

watch(dir, { recursive: true }, function (evt, name) {

    const current = (new Date).getTime()
    const diff = new Date(current - lastChanged).getSeconds()
    upToDate = false;
    if (lastChanged == 0 || (diff >= TIME_INTERVAL)) {
        fileChangeMessage()
        launchScript()
        upToDate = true
    }
    if (diff !== 0)
        lastChanged = current
    else
        upToDate = true
});

setInterval(() => {
    const current = (new Date).getTime();
    const diff = new Date(current - lastChanged).getSeconds();
    if (diff >= 1 && !upToDate) {
        launchScript()
        upToDate = true
    }
}, TIME_CHECK)

function fileChangeMessage() {
    console.log('==========================================')
    console.log('       Some files has been changed')
    console.log('==========================================')
}

function helpMessage() {
    console.log("watchit-proj <directory to check in absolute> <script to launch> [true if windows]")
}

function launchScript() {
    console.log('Launch script %s !', script)

    if (proc)
        proc.kill('SIGINT')
    proc = exec((!isWindows ? 'sh ' : '') + script, function (error, stdout, stderr) {
        console.log('Output script ' + stdout)
        if (error !== null) {
            console.log('Error: ' + error)
        }
    })
}

