import { ModelBoot } from 'loopback-model-binder';

export default class MongoBoot extends ModelBoot {
  constructor(app) {
    super(app, __dirname);
  }

   /**
   * Overrides the base configs
   * change the datasource root directory
   * @readonly
   */
  get configs(){
    /// create local/temporary variable
    /// this will prevent overriding the parent configs
    let overrideConfigs = Object.assign({}, super.configs);
    
    /// only MaritalStatus collection should seed the data
    /// should be same as in the collections property in mongo-model.json file
    overrideConfigs.seed.models = ["MaritalStatus"];
    
    return overrideConfigs;
  } 
}