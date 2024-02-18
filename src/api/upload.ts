import { APIGatewayProxyEvent } from 'aws-lambda'
import { parse } from 'lambda-multipart-parser'
import { ErrorType, StatusCode } from '../helpers/enums'
import {
  fileInfoModel,
  s3DataModel,
  s3ParamsModel,
  userInfoModel,
} from '../helpers/model'
import {
  createData,
  formatResponse,
  limitCheck,
  measureBinarySize,
  s3Upload,
} from '../helpers/util'

export const uploadFile = async (event: APIGatewayProxyEvent) => {
  try {
    let folder: string = ''
    let userId, userName, userEmail

    if (event.requestContext.authorizer) {
      userId = process.env.IS_OFFLINE
        ? event.headers.id
        : event.requestContext.authorizer.claims.sub

      userName = process.env.IS_OFFLINE
        ? event.headers.name
        : event.requestContext.authorizer.claims.name

      userEmail = process.env.IS_OFFLINE
        ? event.headers.email
        : event.requestContext.authorizer.claims.email
    }

    if (userEmail === undefined) {
      return formatResponse(StatusCode.ERROR, ErrorType.AUTH)
    }

    const sizeLimit = await limitCheck(userEmail)

    if (sizeLimit > parseInt(process.env.SIZELIMIT as string)) {
      return formatResponse(StatusCode.OVERLIMIT, ErrorType.SIZE)
    }

    const result = await parse(event)

    if (result.files.length > 1) {
      return formatResponse(StatusCode.FORBIDDEN, ErrorType.UPLOAD)
    }

    const docFile = result.files[0]

    if (
      measureBinarySize(docFile.content) >
      parseInt(process.env.FILELIMIT as string)
    ) {
      return formatResponse(StatusCode.OVERLIMIT, ErrorType.FILE)
    }

    if (userName !== undefined) {
      folder = userName.replace(/ /g, '-')
    }

    const docParam: s3ParamsModel = {
      Bucket: process.env.UPLOAD as string,
      Key: `images/${folder}/${
        docFile.fieldname
      }-${new Date().toISOString().replace('.', '-')}-${docFile.filename
        .split(' ')
        .join('-')}`.toLowerCase(),
      Body: docFile.content as unknown as string,
      ContentType: docFile.contentType,
    }

    try {
      const s3Info = await s3Upload(docParam)

      const userInfo: userInfoModel = {
        userId,
        userName,
        userEmail,
      }

      const fileInfo: fileInfoModel = {
        fileName: docFile.fieldname,
        fileSize: s3Info.size,
        byteSize: s3Info.bytes,
        fileType: s3Info.type,
        entityTag: s3Info.eTag,
        s3Uri: s3Info.location,
      }

      const item: s3DataModel = {
        ...userInfo,
        ...fileInfo,
      }

      const inputData = await createData(item)

      if (!inputData) {
        return formatResponse(StatusCode.ERROR, ErrorType.DATA)
      }

      return formatResponse(StatusCode.SUCCESS, item)
    } catch (error) {
      console.error(error)

      return formatResponse(StatusCode.ERROR, ErrorType.S3ERROR)
    }
  } catch (error) {
    console.error(error)

    return formatResponse(StatusCode.ERROR, ErrorType.API)
  }
}
