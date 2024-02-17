import { APIGatewayProxyEvent } from 'aws-lambda'
import { formatResponse, getFileData, getUserData } from '../helpers/util'
import { ErrorType, StatusCode } from '../helpers/enums'

export const getFile = async (event: APIGatewayProxyEvent) => {
  try {
    const fileId = event.pathParameters.fileId

    const userId = process.env.IS_OFFLINE
      ? event.headers.userId
      : event.requestContext.authorizer.claims.sub

    const result = await getFileData(fileId, userId)

    return formatResponse(StatusCode.SUCCESS, result)
  } catch (error) {
    console.error(error)

    return formatResponse(StatusCode.ERROR, ErrorType.API)
  }
}

export const getUser = async (event: APIGatewayProxyEvent) => {
  try {
    const userEmail = process.env.IS_OFFLINE
      ? event.headers.email
      : event.requestContext.authorizer.claims.email

    const result = await getUserData(userEmail)

    return formatResponse(StatusCode.SUCCESS, result)
  } catch (error) {
    console.error(error)

    return formatResponse(StatusCode.ERROR, ErrorType.API)
  }
}
