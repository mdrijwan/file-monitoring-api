export enum StatusCode {
  SUCCESS = 200,
  ERROR = 500,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOTALLOWED = 405,
  OVERLIMIT = 413,
}

export enum ErrorType {
  API = 'INTERNAL SERVER ERROR: SOMETHING WENT WRONG',
  AUTH = 'UNAUTHORIZED: USER NOT AUTHORIZED',
  DATA = 'DATABASE ERROR: DATA CREATION FAILURE',
  S3ERROR = 'S3 ERROR: S3 UPLOAD FAILURE',
  UPLOAD = 'NOT ALLOWED: MULTIPLE FILES UPLOAD',
  SIZE = 'CONTENT TOO LARGE: TOTAL UPLOAD SPACE LIMIT REACHED',
  SPACE = 'CONTENT TOO LARGE: FILE EXCEEDS TOTAL UPLOAD SPACE',
  FILE = 'CONTENT TOO LARGE: FILE EXCEEDS THE UPLOAD LIMIT',
  NUMBER = 'FORBIDDEN: TOTAL NUMBER OF FILE UPLOAD REACHED',
}
