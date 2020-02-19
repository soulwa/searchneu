export function convertNodeIdToCursor(id) {
  return bota(id.toString());
}

export function bota(input) {
  return new Buffer.from(input.toString(), 'binary').toString('base64');
}

export function convertCursorToNodeId(cursor) {
  return parseInt(atob(cursor), 10);
}

export function atob(input) {
  return new Buffer.from(input, 'base64').toString('binary');
}
