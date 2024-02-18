import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { units } from './constants'
import { s3DataModel, s3ParamsModel } from './model'

const config = { region: process.env.AWS_REGION }

const table = process.env.TABLE

const s3 = new S3Client(config)

const ddbClient = new DynamoDBClient(config)

const docClient = DynamoDBDocumentClient.from(ddbClient)

export const formatResponse = (statusCode: number, response: unknown) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, id, name, email',
  },
  body: JSON.stringify(response, null, '\t'),
})

export const createData = async function (item: s3DataModel) {
  const input = {
    TableName: table,
    Item: {
      fileId: uuidv4(),
      userId: item.userId,
      userName: item.userName,
      userEmail: item.userEmail,
      fileName: item.fileName,
      fileSize: item.fileSize,
      fileType: item.fileType,
      byteSize: item.byteSize,
    },
  }
  try {
    const command = new PutCommand(input)

    await docClient.send(command)

    return item
  } catch (error) {
    console.log('ERROR', error)

    return error
  }
}

export const getFileData = async function (fileId: string, userId: string) {
  let item

  const input = {
    TableName: table,
    Key: {
      fileId: fileId,
      userId: userId,
    },
  }
  try {
    const command = new GetCommand(input)

    const result = await docClient.send(command)

    if (!result.Item) {
      return 'No Items were matched against the UserId'
    } else {
      item = Object.assign(result.Item)
    }

    return item
  } catch (error) {
    console.log('ERROR', error)

    return error
  }
}

export const getUserData = async function (email: string) {
  const input = {
    TableName: table,
    IndexName: 'File-Monitor-index',
    KeyConditionExpression: 'userEmail = :email',
    ExpressionAttributeValues: { ':email': email },
  }
  try {
    const command = new QueryCommand(input)

    const result = await docClient.send(command)

    const items = result.Items!

    const sum = items.reduce((total, item) => total + item.byteSize, 0)

    return {
      items,
      totalFiles: items.length,
      totalBytes: sum,
      totalSize: formatBytes(sum),
      remainingSpace: formatBytes(sum - parseInt(process.env.SIZELIMIT as string)),
    }
  } catch (error) {
    console.log('ERROR', error)

    return error
  }
}
export const s3Upload = async function (params: s3ParamsModel) {
  try {
    await s3.send(new PutObjectCommand(params))

    const location = `s3://${params.Bucket}/${params.Key}`

    const key = params.Key

    const response = await s3Info(params)

    const size = response.ContentLength

    return {
      key,
      location,
      type: response.ContentType,
      size: formatBytes(size),
      bytes: size,
      eTag: response.ETag!.replaceAll('"', ''),
    }
  } catch (error) {
    console.log('S3 Upload Error', error)

    throw error
  }
}

async function s3Info(params: s3ParamsModel) {
  const input = {
    Bucket: params.Bucket,
    Key: params.Key,
  }
  const command = new HeadObjectCommand(input)

  const response = await s3.send(command)

  return response
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatBytes(bite: any) {
  let l = 0,
    n = parseInt(bite, 10) || 0

  while (n >= 1024 && ++l) {
    n = n / 1024
  }

  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]
}

export const limitCheck = async function (userEmail: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userData: any = await getUserData(userEmail)

  return userData ? userData.totalBytes : 0
}

export const measureBinarySize = (content: ArrayBuffer | ArrayBufferView): number =>
  content instanceof ArrayBuffer ? content.byteLength : content.byteLength
