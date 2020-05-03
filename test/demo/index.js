// 从这个引入的目的能够看出目的应该是比较各种id生成器的性能
import { v4 as uuid4 } from 'uuid'
import shortid from 'shortid'
import rndm from 'rndm'
import uid from 'uid-safe'

import { nanoid, customAlphabet, random } from '../../'
import { nanoid as nonSecure } from '../../non-secure'

const COUNT = 50 * 1000
const ALPHABET = '0123456789abcdef'
const LENGTH = ALPHABET.length

let nanoid2 = customAlphabet(ALPHABET, LENGTH)

/**
 * @description: 先拓展两个0，然后在3位和6位上加,
 * @param {number} number
 * @return: string
 */
function print (number) {
  return String(Math.floor(number * 100))
    .replace(/\d{6}$/, ',$&')
    .replace(/\d{3}$/, ',$&')
}

function printDistr (title, fn) {
  let data = calcDistr(title, fn)
  let keys = Object.keys(data.chars)
  let length = keys.length
  let dots = ''

  // 计算所有字符出现频次的平均值
  let average = keys.reduce((all, l) => all + data.chars[l], 0) / length

  /*
    其实就是展示一下不同id生成器的不同基础字符的贡献或者说权重
    也就是说这个色带的颜色越均匀每个组成字符的频次就越平均，生成随机id的效果越好
  */
  for (let l of keys.sort()) {
    let distribution = data.chars[l] / average
    dots += `<div class="dot" style="
      background: hsl(${ 200 * distribution }, 100%, 50%);
      width: ${ 100 / length }%;
    ">${ l }</div>`
  }

  // 在计算每秒调用次数的时候，不是很get为什么要乘这个100，为了美观？
  document.body.innerHTML += `<section>
    <span>${ print((COUNT * 1000) / data.time) } ops/sec</span>
    <h2>${ data.title }</h2>
    ${ dots }
  </section>`
}

/**
 * @description: 计算fn id生成方式的总耗时，和统计生成id的各个字符出现的频次
 * @param {string} title
 * @param {function} fun
 * @return:
 */
function calcDistr (title, fn) {
  let chars = {}

  let ids = []
  let j

  let start = Date.now()
  for (j = 0; j < COUNT; j++) ids.push(fn())
  let end = Date.now()

  for (j = 0; j < COUNT; j++) {
    let id = ids[j]
    if (title === 'uuid/v4') id = id.replace(/-./g, '')
    for (let char of id) {
      if (!chars[char]) chars[char] = 0
      chars[char] += 1
    }
  }

  return { title, chars, time: end - start }
}

let tasks = [
  () =>
    printDistr('ideal', () => {
      let result = []
      for (let j = 0; j < LENGTH; j++) {
        result.push(ALPHABET[j])
      }
      return result
    }),
  () => printDistr('nanoid', () => nanoid()),
  () => printDistr('nanoid2', () => nanoid2()),
  () => printDistr('uid.sync', () => uid.sync(21)),
  () => printDistr('uuid/v4', () => uuid4()),
  () => printDistr('shortid', () => shortid()),
  () => printDistr('rndm', () => rndm()),
  () => printDistr('nanoid/non-secure', () => nonSecure()),
  () =>
    printDistr('random % alphabet', () => {
      return [...random(LENGTH)].map(i => ALPHABET[i % ALPHABET.length])
    })
]

function run () {
  if (tasks.length === 0) return
  let task = tasks.shift()
  task()
  setTimeout(run, 10)
}

let html = ''
for (let i = 0; i < 10; i++) {
  html += `<div>${ nanoid() }</div>`
}
document.body.innerHTML = `<main>${ html }</main>`

run()
