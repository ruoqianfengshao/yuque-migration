import * as stream from 'node:stream'
import { promisify } from 'node:util'
import { createWriteStream, statSync, writeFileSync } from 'node:fs'
import axios from 'axios'

import { genCommonOptions, getLakeFileExportUrl } from '../api'
import { LakeType } from '../types'

interface IDownloadFileParams {
  fileUrl: string
  savePath: string
  fileName: string
}

const finished = promisify(stream.finished)
export async function downloadFile(params: IDownloadFileParams) {
  const { fileUrl, savePath, fileName } = params
  return axios
    .get(fileUrl, {
      ...genCommonOptions(),
      responseType: 'stream',
    })
    .then(async (response) => {
      if (response.request?.path?.startsWith('/login')) {
        throw new Error(`"${fileName}" need token`)
      } else if (response.status === 200) {
        const writer = createWriteStream(savePath)
        response.data?.pipe(writer)
        return finished(writer).then(() => ({
          fileUrl,
          savePath,
        }))
      }
      throw new Error(`response status ${response.status}`)
    })
}

type exportLakeFileProps = {
  id: number
  type: LakeType
  articleTitle: string
  savePath: string
}

const lakeEmpty = (title: string) =>
  `<!doctype lake><title>${title}</title><meta name="doc-version" content="1" /><meta name="viewport" content="fixed" /><meta name="typography" content="classic" /><meta name="paragraphSpacing" content="relax" /><p data-lake-id="u01d689b5" id="u01d689b5">空<br></p>`
const lakeboardEmpty = () =>
  '{"format":"lakeboard","type":"Board","version":"1.0","diagramData":{"head":{"version":"2.0.0","theme":{"name":"default"},"rough":{"name":"default"}},"body":[{"type":"text","html":"空","shape":"text","id":"90b1fa46-4cc5-4845-a04d-9115288e1ede","x":-236.5,"y":183,"defaultContentStyle":{"color":"#262626"},"zIndex":0}]},"mode":"edit","viewportSetting":{"zoom":1,"tlCanvasPoint":[-590.5,0,1],"width":1181,"height":561},"viewportOption":"adapt","text":"空","graphicsBBox":{"x":-236.5,"y":183,"width":32,"height":33}}'
const lakesheetEmpty = () =>
  '{"format":"lakesheet","version":"3.5.5","larkJson":true,"sheet":"xMÍ\nÂ0\u0010ßeÏ9¤\u0005\u0015rÍÁ«Ø£x\bÍªü@º­BÉ»¤\u0011{Yvvç\u001bæ¶W\u000eAÀðB¤\u000e\u0018Äðaö\u0004¢çÁ\u0016G2ÁO Öò\u0004q`0\u0006ÿ{sW¡2´ l¾M]+*VâRefçx\u0018K\u0018·Ýx\u001f\u0010|\u001fÛ\u001f\u00198OhmcÎåÏ§ÍÕµ"UZòßH);BÄªî_E¢M\f","calcChain":[],"vessels":{},"useUTC":true,"useIndex":true,"customColors":[],"meta":{"sort":0,"shareFilter":0},"formulaCalclated":true,"versionId":"zgSyBKcxfZQfGX6L"}'
const laketableEmpty = () =>
  '{"format":"laketable","type":"Table","version":1.4,"larkJson":true,"sheet":[{"columns":[{"name":"文本","type":"textarea","id":"flddlnm7kp3nz1a2zh2zyubn96rjxd6b","enableAI":null,"aiPrompt":null,"enableAutoAIGC":null,"config":null}],"colCount":1,"defaultView":"ixegahciqhdvgufkb8r1z8wg6gds3v9i","activeView":"ixegahciqhdvgufkb8r1z8wg6gds3v9i","id":"xsvgpqv052ehlkgl39xb2m9y85q64re7","views":{"ixegahciqhdvgufkb8r1z8wg6gds3v9i":{"colCount":1,"data":{},"frozenCol":0,"index":0,"rowCount":0,"rowHeight":{"type":"low","name":"低","value":36},"scrollX":0,"scrollY":0,"selections":{},"iid":11936578,"id":"ixegahciqhdvgufkb8r1z8wg6gds3v9i","name":"表格视图","type":"GRID","tableId":"xsvgpqv052ehlkgl39xb2m9y85q64re7","rows":[],"columns":[{"id":"flddlnm7kp3nz1a2zh2zyubn96rjxd6b"}],"group":[],"stats":{"flddlnm7kp3nz1a2zh2zyubn96rjxd6b":"count"}}}}],"tableId":28699816,"sheetId":"xsvgpqv052ehlkgl39xb2m9y85q64re7","records":[]}'

const lakeEmptyMap = {
  lake: lakeEmpty,
  lakeboard: lakeboardEmpty,
  lakesheet: lakesheetEmpty,
  laketable: laketableEmpty,
}

export const writeEmptyFile = (
  filePath: string,
  type: LakeType,
  title: string,
) => {
  const content = lakeEmptyMap[type](title)
  writeFileSync(`${filePath}`, content, {
    encoding: 'utf-8',
  })
}

export const exportLakeFile = async ({
  id,
  type,
  articleTitle,
  savePath,
}: exportLakeFileProps) => {
  const filePath = `${savePath}/${articleTitle}.${type}`
  try {
    const data = await getLakeFileExportUrl({
      id,
      type,
    })

    if (data.status === 400) {
      writeEmptyFile(filePath, type, articleTitle)
    }

    if (data.url) {
      await downloadFile({
        fileUrl: data.url,
        fileName: `${articleTitle}.${type}`,
        savePath: filePath,
      }).then(() => {
        if (statSync(filePath).size === 0) {
          writeEmptyFile(filePath, type, articleTitle)
        }
      })
    }
  } catch (e) {
    throw new Error(`export lake file error: ${e}`)
  }
}
