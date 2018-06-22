// From https://gist.github.com/siddMahen/1486071

const singleTag = {
				area: "/",
				base: "/",
				basefont: "/",
				br: "/",
				col: "/",
				frame: "/",
				hr: "/",
				img: "/",
				input: "/",
				isindex: "/",
				link: "/",
				meta: "/",
				param: "/",
				embed: "/",
				include: "/",
				yield: "/"
			},
			tagType = {
				tag: 1,
				script: 1,
				link: 1,
				style: 1,
				template: 1
			}

const render = module.exports = (dom, output, isParent=true) => {

	dom = Array.isArray(dom) ? dom:[dom]
	output = output || []

	let renderTag = (elem) => {

    let tag = "<" + elem.name

		if (elem.attribs)
			for (e in elem.attribs)
				tag += ` ${e}="${elem.attribs[e]}"`

	  tag += singleTag[elem.name] || "" + ">"
	  return tag

	}

	dom.forEach((elem, i) => {

		if (elem.raw === null)
			return

		if (elem.data && elem.data.match(/^%[\s\S]*%$/) !== null)
	    elem.type = "template"

		if (tagType[elem.type])
	    output.push(renderTag(elem))
		else
			switch (elem.type) {
				case "directive":
					output.push(`<${elem.data}>`)
					break
				case "comment":
					output.push(`<!--${elem.data}-->`)
					break
				default:
					output.push(elem.data)
			}

		if (elem.children)
			output.push(render(elem.children, [], false))

		if (!singleTag[elem.name] && tagType[elem.type])
      output.push(`${isParent ? "\n":""}</${elem.name}>`)

	})

	return output.join("")
}
