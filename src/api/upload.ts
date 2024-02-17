import { v4 as uuidv4 } from 'uuid'
import { parse } from 'lambda-multipart-parser'
import {
  createData,
  formatResponse,
  limitCheck,
  s3Upload,
} from '../helpers/util'
import { ErrorType, StatusCode } from '../helpers/enums'
import {
  s3ParamsModel,
  userInfoModel,
  fileInfoModel,
  s3DataModel,
} from '../helpers/model'
import { APIGatewayProxyEvent } from 'aws-lambda'

export const uploadFile = async (event: APIGatewayProxyEvent) => {
  try {
    const userId = process.env.IS_OFFLINE
      ? event.headers.id
      : event.requestContext.authorizer.claims.sub

    const userName = process.env.IS_OFFLINE
      ? event.headers.name
      : event.requestContext.authorizer.claims.name

    const userEmail = process.env.IS_OFFLINE
      ? event.headers.email
      : event.requestContext.authorizer.claims.email

    if (!userEmail) {
      return formatResponse(StatusCode.ERROR, ErrorType.AUTH)
    }

    const sizeLimit = await limitCheck(userEmail)

    if (sizeLimit > process.env.LIMIT) {
      return formatResponse(StatusCode.OVERLIMIT, ErrorType.SIZE)
    }

    const result = await parse(event)

    if (result.files.length > 1) {
      return formatResponse(StatusCode.FORBIDDEN, ErrorType.FILE)
    }

    const docFile = result.files[0]

    const docParam: s3ParamsModel = {
      Bucket: process.env.UPLOAD as string,
      Key: `images/${userName.replace(/ /g, '-')}/${
        docFile.fieldname
      }-${new Date().toISOString().replace('.', '-')}-${docFile.filename
        .split(' ')
        .join('-')}`.toLowerCase(),
      Body: docFile.content as unknown as string,
      ContentType: docFile.contentType,
    }

    const s3Info = await s3Upload(docParam)

    const userInfo: userInfoModel = {
      userId: userId,
      userName: userName,
      userEmail: userEmail,
    }

    const fileInfo: fileInfoModel = {
      fileName: docFile.fieldname,
      fileSize: s3Info.size,
      byteSize: s3Info.bytes,
      fileType: s3Info.type,
      entityTag: s3Info.eTag,
      s3Uri: s3Info.location,
    }

    const data: s3DataModel = {
      ...userInfo,
      ...fileInfo,
    }

    const item = {
      fileId: uuidv4(),
      ...data,
    }

    const inputData = await createData(item)

    if (!inputData) {
      return formatResponse(StatusCode.ERROR, ErrorType.DATA)
    }

    return formatResponse(StatusCode.SUCCESS, data)
  } catch (error) {
    console.error(error)

    return formatResponse(StatusCode.ERROR, ErrorType.API)
  }
}
