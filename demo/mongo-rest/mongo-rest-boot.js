import { ModelBoot } from 'loopback-model-binder';

export default class MongoRestBoot extends ModelBoot {
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
    
    /// change/override the dsRootDir (datasources files directory)
    overrideConfigs.dsRootDir = `${__dirname}/datasources`;
    
    return overrideConfigs;
  }

}