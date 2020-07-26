export default class Tool {
    findItem(l, a, v) {
        for(let i = 0; i < l.length(); i++) {
            if(l[i][a] === v) {
                return i;
            }
        }
        return -1;
    }
}

export const shuffle = (list) => {
    let newArray = [...list];
    let j = 0;
    let temp = null;
    for(let i = newArray.length - 1; i > 0; i-=1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = newArray[i];
        newArray[i] = newArray[j];
        newArray[j] = temp;
    }
    return newArray;
}