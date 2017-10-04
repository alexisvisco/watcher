#!/usr/bin/env node

const { exec } = require('child_process')
const chokidar = require('chokidar');
const path = require('path')
const fs = require('fs')
const util = require('util');
const arg1 = process.argv[2]
const os = require('os');

let proc
let id

if (arg1 === "help" || arg1 === undefined) {
    helpMessage()
    process.exit()
}
else if (arg1 === "generate-config") {
    const file = path.join(process.cwd(), 'config_watcher.json')
    const js = require('./config.json')
    js.directory = process.cwd()
    fs.writeFileSync(file, JSON.stringify(js, null, 2), 'utf-8');
    console.log("You have successfully generated a configuration file !")
    process.exit()
}

const config = getConfigObject()
let logStream = getLogStream()

/**
 * Launch script for the first time
 */
launchScript(true)


/**
 * Watch file changes at the directory mentioned in the config file.
 * If a file change launch a timeout with x seconds interval.
 * If several files change in a lapse of time reduces the script will 
 * be executed once.
 */
const watcher = chokidar.watch(config.directory, { ignored: /(^|[\/\\])\../, ignoreInitial: true })
    .on('all', (stats, path) => {
        console.log("\n   Watcher > " + stats + " : " + path);
        if (id)
            clearTimeout(id)
        id = setTimeout(launchScript, config.time_interval * 1000)
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
    console.log("Watcher > watcher generate-config - Generate a config in the current directory.")
    console.log("Watcher > watcher <start | file destination of the configuration file in absolute>.")
}

/**
 * Get the config in the current command executed directory
 * or in a precised directory passed in argument.
 */
function getConfigObject() {
    if (forceRequire(path.join(process.cwd(), 'config_watcher.json')) === undefined && forceRequire(arg1 === undefined))
    {
        console.log("No watcher config available, use 'watcher generate-config'.")
        process.exit()
    }
    return forceRequire(path.join(process.cwd(), 'config_watcher.json')) || forceRequire(arg1);
}

/**
 * Get the log directory defined in the config.
 * If directory is invalid or not created, no log
 * can be performed.
 */
function getLogStream()
{
    if (fs.existsSync(config.log_folder))
        return fs.createWriteStream(path.join(config.log_folder,  new Date().toISOString()).replace(/T/, ' ').replace(/\..+/, '') + '.log', {flags: 'a'})
    return undefined;
}

/**
 * Function that return undefined if require thrown an error.
 * @param {String} modulePath 
 */
function forceRequire(modulePath) {
    try {
        return require(modulePath);
    }
    catch (e) {
        return undefined;
    }
}

/**
 * Kill the process if not undefined, launch script
 * (using command passed in the configuration file)
 * Redirect output (error and standart output) in the console
 * and in log file if it exist.
 * @param {Boolean} isBegin 
 */
function launchScript(isBegin) {
    isBegin ? beginStart() : fileChangeMessage()
    if (proc)
        killProcess()
    proc = exec(config.command, function (error, stdout, stderr) {
        console.log("\n")
    })

    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stderr)

    if (logStream)
    {
        proc.stdout.pipe(logStream)
        proc.stderr.pipe(logStream)
    }
}

/**
 * Custom kill process function that work, i think ...
 */
function killProcess()
{
    if (logStream)
    {
        logStream.close()
        logStream = getLogStream()
    }
    if(os.platform() === 'win32')
        proc.exec('taskkill /pid ' + ps.pid + ' /T /F')
    else
        kill(proc.pid)
}

function kill(pid, signal, callback) {
    const psTree = require('ps-tree');
    signal   = signal || 'SIGKILL';
    callback = callback || function () {};
    var killTree = true;
    if(killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try { process.kill(tpid, signal) }
                catch (ex) { }
            });
            callback();
        });
    } else {
        try { process.kill(pid, signal) }
        catch (ex) { }
        callback();
    }
};