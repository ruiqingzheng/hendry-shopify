// 归并排序中的部分, 需要把两个有序数组合并为有序数组
const a = [1, 2, 3, 3, 4, 5, 7]
const b = [2, 11, 13, 19, 21, 22, 25, 28]

function merge(array1, array2) {
  const count = Math.max(array1.length, array2.length)
  const result = []
  while (array1.length > 0 || array2.length > 0) {
    const element = array1[0] && array1[0] < array2[0] ? array1.shift() : array2.shift()
    result.push(element)
  }
  return result
}

console.log('result: ', merge(a, b))
