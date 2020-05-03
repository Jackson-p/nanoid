let crypto = require('crypto')
const ALPHABET = '0123456789abcdef'
const LENGTH = ALPHABET.length

let buffers = {}

let random = bytes => {
  let buffer = buffers[bytes]
  if (!buffer) {
    // `Buffer.allocUnsafe()` is faster because it doesn’t flush the memory.
    // Memory flushing is unnecessary since the buffer allocation itself resets
    // the memory with the new bytes.
    buffer = Buffer.allocUnsafe(bytes)
    if (bytes <= 255) buffers[bytes] = buffer
  }
  return crypto.randomFillSync(buffer)
}

console.log('random(LENGTH)', random(LENGTH), [...random(LENGTH)])

// const randomId =
// [...random(LENGTH)].map((i) => ALPHABET[i % ALPHABET.length]);

// console.log('randomId', randomId);
