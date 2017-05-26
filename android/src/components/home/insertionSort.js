export default function insertionSortModified(arr) {
      const aux = [];

      for (let list in arr) {
        aux.push(arr[list]);
      }
      let n = arr.length,
          temp;

          for(var i=1;i<n;i++) {

              temp = aux[i];
              if (temp.list[0].createdAt === undefined) continue;
              let tempElapsed = (new Date() / 1000) - temp.list[0].createdAt;

              for(var j=i-1;j>=0;j--) {
                if (aux[j].list[0].createdAt === undefined) continue;
                let earlyElapased = (new Date() / 1000) - aux[j].list[0].createdAt;

                if (((temp.list[0].timeLength * 60 * 60) - tempElapsed) > ((aux[j].list[0].timeLength * 60 * 60) - earlyElapased)) {
                   aux[j+1] = aux[j];
                } else {
                  break
                }
              }
              aux[j+1] = temp;
          }
   let res = {};
   aux.reverse();
   for (let i = 0; i < aux.length; i++) {
     res[i + ''] = aux[i];
   }

   return res;
}
