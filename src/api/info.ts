import { APIGatewayProxyEvent } from 'aws-lambda'
import { ErrorType, StatusCode } from '../helpers/enums'
import { formatResponse, getFileData, getUserData } from '../helpers/util'

export const getFile = async (event: APIGatewayProxyEvent) => {
  try {
    let fileId, userId

    if (event.pathParameters) {
      fileId = event.pathParameters.fileId
    }

    if (event.requestContext.authorizer) {
      userId = process.env.IS_OFFLINE
        ? event.headers.userId
        : event.requestContext.authorizer.claims.sub
    }

    const result = await getFileData(fileId!, userId)

    return formatResponse(StatusCode.SUCCESS, result)
  } catch (error) {
    console.error(error)

    return formatResponse(StatusCode.ERROR, ErrorType.API)
  }
}

export const getUser = async (event: APIGatewayProxyEvent) => {
  try {
    let userEmail

    if (event.requestContext.authorizer) {
      userEmail = process.env.IS_OFFLINE
        ? event.headers.email
        : event.requestContext.authorizer.claims.email
    }

    const result = await getUserData(userEmail)

    return formatResponse(StatusCode.SUCCESS, result)
  } catch (error) {
    console.error(error)

    return formatResponse(StatusCode.ERROR, ErrorType.API)
  }
}
