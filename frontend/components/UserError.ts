import macros from './macros';

export default class UserError extends Error {
  property: any[];

  constructor(message, items) {
    super(message);
    this.property = items;
  }

  logError() {
    macros.error(this.message, this.property);
  }
}
