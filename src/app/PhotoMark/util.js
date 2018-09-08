export const filterSubmit = (defaultForm, faceMap, oj) => {
  const shouldUpdateArr = [];
  const shouldUpdateId = [];
  let keys = Object.keys(oj);
  let idMap = {};
  let newFaces = [];
  for (let i = 0; i < keys.length; i++) {

    let nName = '未命名';
    let tags = '';
    let id = '';

    if (keys[i].startsWith('tags_')) {
      let tagKeyArr = keys[i].split('tags_');
      id = tagKeyArr[1];
      tags = oj[keys[i]];
      if (tags) {
        tags = tags.split(',');
        if (tags.length === 1) {
          tags = tags[0].split('，')
        }
      } else {
        tags = []
      }

      nName = oj[id] || defaultForm[id] || '未命名';

      if (!idMap[id]) {
        idMap[id] = true
        newFaces.push({
          ...faceMap[id],
          name: nName,
          tags: tags
        })
      }

    } else {
      id = keys[i];

      nName = oj[id] || defaultForm[id] || '未命名';

      if (!idMap[id]) {
        idMap[id] = true;
        tags = oj['tags_' + id];
        if (tags) {
          tags = tags.split(',');
          if (tags.length === 1) {
            tags = tags[0].split('，')
          }
        } else {
          tags = []
        }

        newFaces.push({
          ...faceMap[id],
          name: nName || '未命名',
          tags: tags
        })
      }
    }
    if (
      (nName !== '未命名' && nName !== defaultForm[id])
      || (tags && (tags.join(',') !== defaultForm['tags_' + id]))
    ) {
      if(shouldUpdateId.indexOf(id)===-1) {
        shouldUpdateArr.push({
          _id: id, name: nName, tags: tags
        })
        shouldUpdateId.push(id)
      }
      
    }
  }
  return {
    shouldUpdateArr,
    newFaces
  }
}