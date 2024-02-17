export enum StatusCode {
  SUCCESS = 200,
  ERROR = 500,
  FORBIDDEN = 300,
  OVERLIMIT = 413,
}

export enum ErrorType {
  API = 'API ERROR: SOMETHING WENT WRONG',
  AUTH = 'AUTH ERROR: USER NOT AUTHORIZED',
  DATA = 'DB ERROR: DATA CREATION FAILURE',
  UPLOAD = 'S3 ERROR: UPLOAD FAILURE',
  FILE = 'NOT ALLOWED: MULTIPLE FILE UPLOAD',
  SIZE = 'FILE SIZE LIMIT REACHED',
}
