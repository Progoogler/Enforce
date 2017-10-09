export default function insertionSortModified(arr: object): array {
  const aux = [];
  var now = new Date();

  for (let list in arr) {
    aux.push(arr[list]);
  }

  for (let i = 1; i < aux.length; i++) {
    let temp = aux[i];
    
    if (temp.list[0].createdAt === undefined) continue;
    let tempElapsed = (temp.list[0].timeLength * 60 * 60 * 1000) - (now - temp.list[0].createdAt);

    for (let j = i - 1; j >= 0; j--) {
      if (aux[j].list[0].createdAt === undefined) continue;
      let earlyElapsed = (aux[j].list[0].timeLength * 60 * 60 * 1000) - (now - aux[j].list[0].createdAt);

      if (tempElapsed < earlyElapsed) {
        swap(aux, j+1, j);
      } else {
        break
      }
    }
  }
  return aux;
}

function swap(arr, elm1, elm2) {
  var temp = arr[elm1];
  arr[elm1] = arr[elm2];
  arr[elm2] = temp;
}
