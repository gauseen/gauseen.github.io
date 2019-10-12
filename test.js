"1 2 3".replace(/d/g, replacer)

function replacer (...rest) {
  console.log(rest)
}
