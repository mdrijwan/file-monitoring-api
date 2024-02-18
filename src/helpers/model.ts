export type s3ParamsModel = {
  Bucket: string
  Key: string
  Body: string
  ContentType: string
}

export type userInfoModel = {
  userId: string
  userName: string
  userEmail: string
}

export type fileInfoModel = {
  fileName: string
  fileType?: string
  fileSize: string
  byteSize?: number
  entityTag: string
  fileStatus?: string
  s3Uri: string
}

export type s3DataModel = userInfoModel & fileInfoModel
