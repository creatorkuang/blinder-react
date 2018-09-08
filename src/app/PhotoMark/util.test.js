import {filterSubmit} from './util';

it('check mark form Submit',()=>{
  const defaultForm = {
    "u1": "未命名",
    "tags_u1": "标签1,tag2",
    "u2": "test",
    "tags_u2": ""
  }
  const faceMap = {
    "u1": {
      _id: "u1",
      name: "未命名",
      tags: [],
      imageData: '1'
    },
    "u2": {
      _id: "u2",
      name: "test",
      tags: [],
      imageData: '2'
    }
  }

  const getMatch = (oj)=>{
    return filterSubmit(defaultForm, faceMap, oj).shouldUpdateArr[0]
  }

  
  // 修改单个tag
  const oj = {
    "u1": "未命名",
    "tags_u1": "标签1,tag2",
    "u2": "test",
    "tags_u2": "人工智能,区块链"
  }

 
  expect(getMatch(oj).tags.join(',')).toEqual(oj['tags_u2']);
  
  // // 修改名字
  const oj2 = {
    "u1": "未命名",
    "tags_u1": "标签1,tag2",
    "u2": "test2",
    "tags_u2": ""
  }
  expect(getMatch(oj2).name).toEqual(oj2['u2']);
  
   // 命名
   const oj3 = {
    "u1": "testhah",
    "tags_u1": "标签1,tag2",
    "u2": "test",
    "tags_u2": ""
  }
  expect(getMatch(oj3).name).toEqual(oj3['u1']);

  // 同时修改两个
  const oj4 = {
    "u1": "test1",
    "tags_u1": "标签1,tag2",
    "u2": "test",
    "tags_u2": "test2"
  }
  expect(filterSubmit(defaultForm, faceMap, oj4).shouldUpdateArr.length).toEqual(2)
})