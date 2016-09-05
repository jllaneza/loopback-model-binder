/// <reference path="../typings/index.d.ts" />

import { dataSourceLoader } from './datasource-loader';
import { modelBootUtils, IGNORE_FILES } from './model-boot-utils';
import { ReadGlob } from './utils';
import * as Rx from 'rx';

let app = Symbol();
let rootDir = Symbol();
let configValues = Symbol();

/** configs schema
 * let configs = {
 *   files: [
 *     { include: ".//**//*.js", ignore: [] }
 *   ],
 *   seed: {
 *     rootDir: __dirname,
 *     models: []
 *   },
 *   dsRootDir: __dirname,
 *   rootDir: __dirname
 * }
 */

/**
 * Boots the Model/Datasource that you create
 * @class ModelBoot
 */
export default class ModelBoot {

  /**
   * Creates an instance of ModelBoot.
   * @param {any} App => strongloop application object
   * @param {any} RootDir => root directory of the model and dataSource
   */
  constructor(App, RootDir) {
    this[app] = App;
    this[rootDir] = RootDir;
    this[configValues] = null;
  }

  /**
   * Initialize the datasource and model
   */
  onInit(){
    return dataSourceLoader
      .load(this[app], this[rootDir], this.configs.dsRootDir)
      .flatMap((dataSources) => {
        return modelBootUtils.loader(this[app], dataSources, this.configs);
      });
  }

  /**
   * Get or create an configs;
   * its overridable
   * by default it will check *-binder.config.js file
   * if not exist will create default config schema
  */
  get configs(){
    if (!(this[configValues])){
      let _configs = ReadGlob(`${this[rootDir]}/*-binder.config.js`);
      if (_configs && _configs.length > 0){
        if (_configs.length > 1){
          throw new Error(`Only one (1) model binder.config file, should be in ${this[rootDir]}`);  
        }    
        _configs.forEach((configSchema) => {
          this[configValues] = require(configSchema).configs; 
        });
      } else {
        const SEED_ROOT_DIR = `${this[rootDir]}/seeds`;
        this[configValues] = {
          files: [{ include: "./**/*.js", ignore: IGNORE_FILES }],
          seed: {
            rootDir: SEED_ROOT_DIR,
            models: modelBootUtils.getModelSeeds(SEED_ROOT_DIR)
          },
          dsRootDir: this[rootDir],
          rootDir: this[rootDir]
        };
      }
    }
    return this[configValues];
  }
}