#!/usr/bin/env node

const htmlparser = require("htmlparser2"),
      render = require("./renderer"),
      programme = require("commander"),
      fs = require("fs"),
      path = require("path"),
      package = require("./package.json"),
      READLINE = require("readline"),
      readline = READLINE.createInterface({
        input: process.stdin,
        output: process.stdout
      }),
      RED = "\x1b[41m\x1b[37m\e[1m",
      RESET = "\x1b[0m"

let hasSVGO = false,
    SVGO,
    svgo

try {
  SVGO = require("svgo")
  hasSVGO = true
} catch (err) {
  if (err.code != "MODULE_NOT_FOUND")
    console.log(`${RED}${err.message}${RESET}`)
}

if (hasSVGO) {
  let svgoConfObj
  try {
    svgoConfObj = require("./svgo/svgo.json")
  } catch (err) {
    if (err.code != "MODULE_NOT_FOUND")
      console.log(`${RED}${err.message}${RESET}`)
  }

  let svgoConf = []
  if (svgoConfObj)
    Object.keys(svgoConfObj).map(
      (key) => svgoConf.push({[key]: svgoConfObj[key]})
    )
  svgo = new SVGO({plugins: svgoConf})
}

let inputPath, outputDir, repeatedQuestion = false
const handler = (err, dom) => {
    if (err)
      throw err

    let children = {},
        hadSVG = false,
        writeSVG = (svg, id) => {
          fs.writeFile(path.join(outputDir, `${inputPath.name}-${id}.svg`), svg, "utf8", (err) => {
            if (err)
              throw err
          })
        }
    dom.forEach((svg, i) => {
      if (svg.name == "svg") {
        hadSVG = true
        svg.children.forEach((g, i) => {
          if (g.name == "g") {
            let id = g.attribs["inkscape:label"] || g.attribs["id"] || i.toString().padStart(Math.ceil(Math.log10(svg.children.length-1)))
            children[id.replace(/ /g, "")] = g
            svg.children.splice(i, 1)
          }
        })
        svg.children.push({})
        Object.keys(children).forEach((id) => {
          svg.children[svg.children.length-1] = children[id]
          let currSVG = render(svg)
          if (hasSVGO && programme.opt)
            svgo
              .optimize(currSVG)
              .then((result) => writeSVG(result.data, id))
              .catch((err) => {
                if (err)
                  throw err
              })
          else
            writeSVG(currSVG.replace(/[\r\n]^\s*$/gm, ""), id)
        })
      } else if (i == dom.length-1 && !hadSVG) {
        throw new Error(`${inputPath.path} is not an SVG file`)
      }
    })
},
overwriteQuestion = (outputDir) => `
It appears that the directory ${outputDir} already exists.
${repeatedQuestion ? "":`This means that there is a possibility of previously deconstructed SVG files being overwritten.
`}Would you like to continue? [y/N] `

programme
  .version(package.version, "-v, --version")
  .usage("[options] input.svg [input1.svg ...]")
  .description(package.description)
  .option("-f, --force-overwrite", "force overwrite deconstructed SVGs")
  .option("-o, --output-dir [dir]", "specify an output directory")
  .option("-n, --no-opt", "do not optimise using SVGO")
  .action((...files) => {
    files.splice(-1)
    let i = 0,
        callback = (err) => {
          if (err)
            console.log(`\n${RED}${err.message}${RESET}`)
          if (++i < files.length)
            svgDeconstruct(files[i], callback, true)
          else
            readline.close()
        }
    if (programme.outputDir)
      fs.mkdir(programme.outputDir, (err) => {
        if (err & err.code != "EEXIST")
          console.log(`\n${RED}${err.message}${RESET}`)
        svgDeconstruct(files[0], callback)
      })
    else
      svgDeconstruct(files[0], callback)
  })
  .parse(process.argv)

if (programme.args.length === 0)
  programme.help()



function svgDeconstruct(input, callback, repeat=false) {
  let finishWrite = (rawSVG) => {
    let parser = new htmlparser.Parser(new htmlparser.DomHandler(handler), {xmlMode: true})
    try {
      parser.write(rawSVG)
      parser.end()
      callback()
    } catch (err) {
      callback(err)
    }
  }
  fs.readFile(input, "utf-8", (err, rawSVG) => {
    inputPath = path.parse(input)
    inputPath.path = input
    if (err)
      if (err.code == "ENOENT") {
        throw new Error(`${input} does not exist`)
      } else if (err.code == "EISDIR") {
        callback()
        return
      } else {
        throw err
      }

    if (inputPath.ext != ".svg")
      throw new Error(`${input} is not an SVG file`)

    outputDir = path.join(programme.outputDir || inputPath.dir, inputPath.name)
    fs.mkdir(outputDir, (err) => {
      if (err && (err.code != "EEXIST" || !programme.forceOverwrite)) {
        if (err.code == "EEXIST")
          readline.question(overwriteQuestion(outputDir), (ans = "n") => {
            repeatedQuestion = true
            if (ans.trim() && ans.trim()[0].toLowerCase() == "y")
              finishWrite(rawSVG)
            else
              callback()
          })
        else
          throw err
      } else {
        finishWrite(rawSVG)
      }
    })
  })
}
