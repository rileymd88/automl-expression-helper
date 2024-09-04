/**
 * @typedef {object}
 * @entry
 */
const properties = {
  /**
   * Current version of this generic object definition.
   * @type {string}
   */
  version: process.env.PACKAGE_VERSION,

  /**
   * @type {string=}
   */
  title: "",

  /**
   * @type {string=}
   */
  subtitle: "",

  /**
   * @type {string=}
   */
  footnote: "",

  /**
   * @type {boolean}
   */
  showTitles: false,

  /**
   * @type {boolean}
   */
  disableNavMenu: true,

  /**
   * @type {boolean}
   */
  showDetails: false,

  visualization: "automl-expression-helper",
};

export default properties;
