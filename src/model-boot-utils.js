/// <reference path="../typings/index.d.ts" />

import { modelLoader } from './model-loader';
import { toPascalCase } from './utils-string';
import { ReadGlob, FileNameWithOutExt } from './utils';
import * as Rx from 'rx';

const IGNORE_FILES = [
    "./**/*.route.js",
    "./index.js",
    "./*-binder.config.js",
    "./*-boot.js",
    "./*-datasources.json",
    "./*-model.json"  
];

let modelBootUtils = {
  loader: (app, dataSources, configs) => {
    return Rx.Observable.create((observer) => {
      modelBootUtils
        .load(app, dataSources, configs)
        .subscribe((value) => {
          modelBootUtils.extend(app, value.dataSources, value.configs);  
          observer.onNext(value.modelName);
          observer.onCompleted();   
        });
    });
  },
  load: (app, dataSources, configs) => {
    let localConfigs = Object.assign({}, configs);
    localConfigs.dataSource = dataSources[0];
    return modelLoader.load(app, localConfigs) 
      .flatMap((modelName) => {
        return Rx.Observable.create((observer) => {
          observer.onNext({ 
            configs: localConfigs,  
            modelName: modelName,
            dataSources: dataSources
          }); 
          observer.onCompleted();
        });
      });  
  },
  extend: (app, dataSources, configs) => {
    if (dataSources.length > 1){
      for(let i = 1; i < dataSources.length; i++){
        modelLoader.extends(app, dataSources[i], configs);
      }
    }
  },
  getModelSeeds: (seedRootDir) => {
    let models = [];
    let files = ReadGlob(`${seedRootDir}/*.js`);
    if (files){
      files.forEach((file) => {
        models.push(toPascalCase(FileNameWithOutExt(file)));
      });
    } 
    return models;
  }
};

export { modelBootUtils, IGNORE_FILES }