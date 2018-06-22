const exec = require('child_process').exec,
      READLINE = require("readline"),
      readline = READLINE.createInterface({
        input: process.stdin,
        output: process.stdout
      })

try {
  require("svgo")
  readline.close()
} catch(err) {
  if (err.code == "MODULE_NOT_FOUND")
  readline.question("SVGO (SVG Optimiser) is not required, although it is recommended.\nWould you like to install it? [y/N] ",
    (ans = "n") => {
      console.log("")
      if (ans && ans.trim()[0].toLowerCase() == "y")
        exec('npm install svgo --no-save', (err, stdout, stderr) => {
          if (stderr)
            console.log(stderr)
          if (err)
            console.log(err.message)
          console.log("\x1b[32mConfiguration for SVG Optimisation can be found in \x1b[4msvgo/svgo.json\x1b[0m\x1b[32m.\nThe default options should work fine.\x1b[0m\n")
        }).stdout.pipe(process.stdout)
      else
        console.log("\x1b[42mIf you ever change your mind, you can just run \x1b[4mnpm install svgo\x1b[0m\n")
      readline.close()
    }
  )
}
