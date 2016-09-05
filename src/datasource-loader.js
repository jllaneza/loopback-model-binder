/// <reference path="../typings/index.d.ts" />

import { isFunction, GetModelSchema, ReadGlob, PathJoin, BaseName, RequireObject } from './utils';
import { toSpinalCase } from './utils-string';
import * as Rx from 'rx';

let dataSourceLoader = {
  /**
  * Load Datasources or attach to strongloop app.
  * @param {app} => strongloop app 
  * @param {dsDirPath} => directory to search the *-datasources.json file. 
  * @return {Observable} 
  */
  load: (app, rootDir, dsDirPath) => {
    let loadDataSource;
    let datasources = ReadGlob(`${dsDirPath}/*-datasources.json`);
    if (datasources){      
      loadDataSource = validateDataSources(rootDir, datasources)       
        .flatMap((options) => {
          return DataSource(app, options);
        });
    }
    return loadDataSource;
  }
},
validateDataSources = (rootDir, dataSources) => {
  let modelName = toSpinalCase(GetModelSchema(rootDir).name);
  let fileName = `${modelName}-datasources.json`;
  let ds = getParentDataSource(fileName, dataSources);  

  return Rx.Observable.create((observer) => {
    if (dataSources.length > 1 && !(ds)){
      let error = new Error(`Should have ${fileName} on ${dsDirPath} directory for multiple dataSources.`);
      observer.onError(error);
    } else {
      observer.onNext({ dataSources: dataSources, dsParent: ds });
      observer.onCompleted();
    }        
  });
},
DataSource = (app, options) => {
  let ds = options.dsParent, 
    dataSources = options.dataSources, 
    newDataSources = [];

  return Rx.Observable.from(dataSources)
    .flatMap((dataSource) => {
      return Rx.Observable.create((observer) => {
        let source = RequireObject(dataSource);
        let dsKeys = Object.keys(source);
        if (ds && (dataSources.length > 1) && (dsKeys && dsKeys.length > 1)){
          let _error = new Error(`File ${ds} should have only one(1) dataSource.`);
          observer.onError(_error);
        } 
        dsKeys.forEach((dsKey) => {
          app.dataSource(dsKey, source[dsKey]);
          if (app.dataSources[dsKey]){
            newDataSources.push(dsKey);
          }
        });
        if ((dataSources.indexOf(dataSource) + 1) === dataSources.length){
          observer.onNext(newDataSources);
          observer.onCompleted();
        }                
      });
    });
},
getParentDataSource = (fileName, dataSources) => {
  let sources = dataSources.filter(ds => {
    return ((BaseName(ds) === fileName));
  });
  return (sources) ? sources[0] : null;
};

export { dataSourceLoader }
