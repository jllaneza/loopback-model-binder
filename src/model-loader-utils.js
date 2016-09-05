/// <reference path="../typings/index.d.ts" />

import { ReadGlob, PathJoin, RequireObject, isFunction } from './utils';
import { toSpinalCase } from './utils-string';
import ModelSeed from './model-seed';
import * as Rx from 'rx';

/// TODO: optional to seed specific Model or Collections
///   It should have Model/Collections list that exempt 
///   from seeding data
let SeedData = (seed, model, collection, dataSource) => {
  if (isCollectionExist(seed.models, collection)){
    let files = ReadGlob(PathJoin(seed.rootDir, `./${toSpinalCase(collection)}.js`));
    if (files){
      let RxNodeCallBack = Rx.Observable.fromNodeCallback(seeFile);
      Rx.Observable
        .for(files, file => RxNodeCallBack(file, model, dataSource))
        .subscribe(() => {});
    }
  }
}, 
isCollectionExist = (models, collection) => {
  let filtered = models.filter((model) => {
    return model === collection;
  });
  return (filtered && filtered.length);
},
seeFile = (file, model, dataSource) => {
  let seed = RequireObject(file);
  if (seed && isFunction(seed)){ 
    let seedObject = new seed(model, dataSource);
    if (seedObject instanceof ModelSeed){
      seedObject.execute(); 
    }
  }
};

export { SeedData };