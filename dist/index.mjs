import D from"axios";import g from"lodash/compact.js";import u from"lodash/each.js";import P from"lodash/filter.js";import U from"lodash/find.js";import A from"lodash/flatten.js";import p from"lodash/get.js";import j from"lodash/groupBy.js";import f from"lodash/isArray.js";import L from"lodash/isBoolean.js";import O from"lodash/isEqual.js";import q from"lodash/isFinite.js";import x from"lodash/isInteger.js";import M from"lodash/isNil.js";import"lodash/isNumber.js";import y from"lodash/isObject.js";import w from"lodash/isString.js";import B from"lodash/keyBy.js";import R from"lodash/keys.js";import c from"lodash/map.js";import G from"lodash/omit.js";import z from"lodash/pickBy.js";import W from"lodash/set.js";import H from"lodash/some.js";import K from"lodash/sortBy.js";import Y from"lodash/times.js";import Z from"lodash/unset.js";import k from"lodash/values.js";function v(s){return Object.keys(s).join(",")}function I(s){let e,t="",r=s;for(;r>0;)e=(r-1)%26,t=String.fromCharCode(e+65)+t,r=(r-e-1)/26;return t}function X(s){let e=0;const{length:t}=s;for(let r=0;r<t;r++)e+=(s.charCodeAt(r)-64)*26**(t-r-1);return e}function S(s){let e="";return Object.keys(s).forEach(t=>{const r=typeof s[t]=="object",a=r&&s[t].length>=0;if(r||(e+=`${t}=${encodeURIComponent(s[t])}&`),r&&a)for(const o of s[t])e+=`${t}=${encodeURIComponent(o)}&`}),e&&e.slice(0,-1)}function J(s){const e=j(s);u(e,(t,r)=>{if(r&&t.length>1)throw new Error(`Duplicate header detected: "${r}". Please make sure all non-empty headers are unique`)})}class E{constructor(e,t,r){this._worksheet=e,this._rowNumber=t,this._rawData=r,this._deleted=!1}get deleted(){return this._deleted}get rowNumber(){return this._rowNumber}_updateRowNumber(e){this._rowNumber=e}get a1Range(){return[this._worksheet.a1SheetName,"!",`A${this._rowNumber}`,":",`${I(this._worksheet.headerValues.length)}${this._rowNumber}`].join("")}get(e){const t=this._worksheet.headerValues.indexOf(e);return this._rawData[t]}set(e,t){const r=this._worksheet.headerValues.indexOf(e);this._rawData[r]=t}assign(e){for(const t in e)this.set(t,e[t])}toObject(){const e={};for(let t=0;t<this._worksheet.headerValues.length;t++){const r=this._worksheet.headerValues[t];r&&(e[r]=this._rawData[t])}return e}async save(e){if(this._deleted)throw new Error("This row has been deleted - call getRows again before making updates.");const t=await this._worksheet._spreadsheet.sheetsApi.request({method:"put",url:`/values/${encodeURIComponent(this.a1Range)}`,params:{valueInputOption:e?.raw?"RAW":"USER_ENTERED",includeValuesInResponse:!0},data:{range:this.a1Range,majorDimension:"ROWS",values:[this._rawData]}});this._rawData=t.data.updatedData.values[0]}async delete(){if(this._deleted)throw new Error("This row has been deleted - call getRows again before making updates.");const e=await this._worksheet._makeSingleUpdateRequest("deleteRange",{range:{sheetId:this._worksheet.sheetId,startRowIndex:this._rowNumber-1,endRowIndex:this._rowNumber},shiftDimension:"ROWS"});return this._deleted=!0,this._worksheet._shiftRowCache(this.rowNumber),e}_clearRowData(){for(let e=0;e<this._rawData.length;e++)this._rawData[e]=""}}class b{constructor(e){this.type=e.type,this.message=e.message}}class F{constructor(e,t,r,a){this._sheet=e,this._rowIndex=t,this._columnIndex=r,this._draftData={},this._updateRawData(a),this._rawData=a}_updateRawData(e){this._rawData=e,this._draftData={},this._rawData?.effectiveValue&&"errorValue"in this._rawData.effectiveValue?this._error=new b(this._rawData.effectiveValue.errorValue):this._error=void 0}get rowIndex(){return this._rowIndex}get columnIndex(){return this._columnIndex}get a1Column(){return I(this._columnIndex+1)}get a1Row(){return this._rowIndex+1}get a1Address(){return`${this.a1Column}${this.a1Row}`}get value(){if(this._draftData.value!==void 0)throw new Error("Value has been changed");return this._error?this._error:this._rawData?.effectiveValue?k(this._rawData.effectiveValue)[0]:null}set value(e){if(e instanceof b)throw new Error("You can't manually set a value to an error");if(L(e))this._draftData.valueType="boolValue";else if(w(e))e.substring(0,1)==="="?this._draftData.valueType="formulaValue":this._draftData.valueType="stringValue";else if(q(e))this._draftData.valueType="numberValue";else if(M(e))this._draftData.valueType="stringValue",e="";else throw new Error("Set value to boolean, string, or number");this._draftData.value=e}get valueType(){return this._error?"errorValue":this._rawData?.effectiveValue?R(this._rawData.effectiveValue)[0]:null}get formattedValue(){return this._rawData?.formattedValue||null}get formula(){return p(this._rawData,"userEnteredValue.formulaValue",null)}set formula(e){if(!e)throw new Error("To clear a formula, set `cell.value = null`");if(e.substring(0,1)!=="=")throw new Error('formula must begin with "="');this.value=e}get formulaError(){return this._error}get errorValue(){return this._error}get numberValue(){if(this.valueType==="numberValue")return this.value}set numberValue(e){this.value=e}get boolValue(){if(this.valueType==="boolValue")return this.value}set boolValue(e){this.value=e}get stringValue(){if(this.valueType==="stringValue")return this.value}set stringValue(e){if(e?.startsWith("="))throw new Error("Use cell.formula to set formula values");this.value=e}get hyperlink(){if(this._draftData.value)throw new Error("Save cell to be able to read hyperlink");return this._rawData?.hyperlink}get note(){return this._draftData.note!==void 0?this._draftData.note:this._rawData?.note}set note(e){if((e==null||e===!1)&&(e=""),!w(e))throw new Error("Note must be a string");e===this._rawData?.note?delete this._draftData.note:this._draftData.note=e}get userEnteredFormat(){return Object.freeze(this._rawData?.userEnteredFormat)}get effectiveFormat(){return Object.freeze(this._rawData?.effectiveFormat)}_getFormatParam(e){if(p(this._draftData,`userEnteredFormat.${e}`))throw new Error("User format is unsaved - save the cell to be able to read it again");return Object.freeze(this._rawData.userEnteredFormat[e])}_setFormatParam(e,t){O(t,p(this._rawData,`userEnteredFormat.${e}`))?Z(this._draftData,`userEnteredFormat.${e}`):(W(this._draftData,`userEnteredFormat.${e}`,t),this._draftData.clearFormat=!1)}get numberFormat(){return this._getFormatParam("numberFormat")}get backgroundColor(){return this._getFormatParam("backgroundColor")}get backgroundColorStyle(){return this._getFormatParam("backgroundColorStyle")}get borders(){return this._getFormatParam("borders")}get padding(){return this._getFormatParam("padding")}get horizontalAlignment(){return this._getFormatParam("horizontalAlignment")}get verticalAlignment(){return this._getFormatParam("verticalAlignment")}get wrapStrategy(){return this._getFormatParam("wrapStrategy")}get textDirection(){return this._getFormatParam("textDirection")}get textFormat(){return this._getFormatParam("textFormat")}get hyperlinkDisplayType(){return this._getFormatParam("hyperlinkDisplayType")}get textRotation(){return this._getFormatParam("textRotation")}set numberFormat(e){this._setFormatParam("numberFormat",e)}set backgroundColor(e){this._setFormatParam("backgroundColor",e)}set backgroundColorStyle(e){this._setFormatParam("backgroundColorStyle",e)}set borders(e){this._setFormatParam("borders",e)}set padding(e){this._setFormatParam("padding",e)}set horizontalAlignment(e){this._setFormatParam("horizontalAlignment",e)}set verticalAlignment(e){this._setFormatParam("verticalAlignment",e)}set wrapStrategy(e){this._setFormatParam("wrapStrategy",e)}set textDirection(e){this._setFormatParam("textDirection",e)}set textFormat(e){this._setFormatParam("textFormat",e)}set hyperlinkDisplayType(e){this._setFormatParam("hyperlinkDisplayType",e)}set textRotation(e){this._setFormatParam("textRotation",e)}clearAllFormatting(){this._draftData.clearFormat=!0,delete this._draftData.userEnteredFormat}get _isDirty(){return!!(this._draftData.note!==void 0||R(this._draftData.userEnteredFormat).length||this._draftData.clearFormat||this._draftData.value!==void 0)}discardUnsavedChanges(){this._draftData={}}async save(){await this._sheet.saveCells([this])}_getUpdateRequest(){const e=this._draftData.value!==void 0,t=this._draftData.note!==void 0,r=!!R(this._draftData.userEnteredFormat||{}).length,a=this._draftData.clearFormat;if(!H([e,t,r,a]))return null;const o={...this._rawData?.userEnteredFormat,...this._draftData.userEnteredFormat};return p(this._draftData,"userEnteredFormat.backgroundColor")&&delete o.backgroundColorStyle,{updateCells:{rows:[{values:[{...e&&{userEnteredValue:{[this._draftData.valueType]:this._draftData.value}},...t&&{note:this._draftData.note},...r&&{userEnteredFormat:o},...a&&{userEnteredFormat:{}}}]}],fields:R(z({userEnteredValue:e,note:t,userEnteredFormat:r||a})).join(","),start:{sheetId:this._sheet.sheetId,rowIndex:this.rowIndex,columnIndex:this.columnIndex}}}}}class V{constructor(e,t,r){this._spreadsheet=e,this._headerRowIndex=1,this._rawProperties=null,this._cells=[],this._rowMetadata=[],this._columnMetadata=[],this._rowCache=[],this._headerRowIndex=1,this._rawProperties=t,this._cells=[],this._rowMetadata=[],this._columnMetadata=[],r&&this._fillCellData(r)}get headerValues(){if(!this._headerValues)throw new Error("Header values are not yet loaded");return this._headerValues}updateRawData(e,t){this._rawProperties=e,this._fillCellData(t)}async _makeSingleUpdateRequest(e,t){return this._spreadsheet._makeSingleUpdateRequest(e,{...t})}_ensureInfoLoaded(){if(!this._rawProperties)throw new Error("You must call `doc.loadInfo()` again before accessing this property")}resetLocalCache(e){e||(this._rawProperties=null),this._headerValues=void 0,this._headerRowIndex=1,this._cells=[]}_fillCellData(e){u(e,t=>{const r=t.startRow||0,a=t.startColumn||0,o=t.rowMetadata.length,h=t.columnMetadata.length;for(let i=0;i<o;i++){const n=r+i;for(let d=0;d<h;d++){const l=a+d;this._cells[n]||(this._cells[n]=[]);const m=p(t,`rowData[${i}].values[${d}]`);this._cells[n][l]?this._cells[n][l]._updateRawData(m):this._cells[n][l]=new F(this,n,l,m)}}for(let i=0;i<t.rowMetadata.length;i++)this._rowMetadata[r+i]=t.rowMetadata[i];for(let i=0;i<t.columnMetadata.length;i++)this._columnMetadata[a+i]=t.columnMetadata[i]})}_addSheetIdToRange(e){if(e.sheetId&&e.sheetId!==this.sheetId)throw new Error("Leave sheet ID blank or set to matching ID of this sheet");return{...e,sheetId:this.sheetId}}_getProp(e){return this._ensureInfoLoaded(),this._rawProperties[e]}_setProp(e,t){throw new Error("Do not update directly - use `updateProperties()`")}get sheetId(){return this._getProp("sheetId")}get title(){return this._getProp("title")}get index(){return this._getProp("index")}get sheetType(){return this._getProp("sheetType")}get gridProperties(){return this._getProp("gridProperties")}get hidden(){return this._getProp("hidden")}get tabColor(){return this._getProp("tabColor")}get rightToLeft(){return this._getProp("rightToLeft")}set sheetId(e){this._setProp("sheetId",e)}set title(e){this._setProp("title",e)}set index(e){this._setProp("index",e)}set sheetType(e){this._setProp("sheetType",e)}set gridProperties(e){this._setProp("gridProperties",e)}set hidden(e){this._setProp("hidden",e)}set tabColor(e){this._setProp("tabColor",e)}set rightToLeft(e){this._setProp("rightToLeft",e)}get rowCount(){return this._ensureInfoLoaded(),this.gridProperties.rowCount}get columnCount(){return this._ensureInfoLoaded(),this.gridProperties.columnCount}get a1SheetName(){return`'${this.title.replace(/'/g,"''")}'`}get encodedA1SheetName(){return encodeURIComponent(this.a1SheetName)}get lastColumnLetter(){return this.columnCount?I(this.columnCount):""}get cellStats(){let e=A(this._cells);return e=g(e),{nonEmpty:P(e,t=>t.value).length,loaded:e.length,total:this.rowCount*this.columnCount}}getCellByA1(e){const t=e.match(/([A-Z]+)([0-9]+)/);if(!t)throw new Error(`Cell address "${e}" not valid`);const r=X(t[1]),a=parseInt(t[2]);return this.getCell(a-1,r-1)}getCell(e,t){if(e<0||t<0)throw new Error("Min coordinate is 0, 0");if(e>=this.rowCount||t>=this.columnCount)throw new Error(`Out of bounds, sheet is ${this.rowCount} by ${this.columnCount}`);if(!p(this._cells,`[${e}][${t}]`))throw new Error("This cell has not been loaded yet");return this._cells[e][t]}async loadCells(e){if(!e)return this._spreadsheet.loadCells(this.a1SheetName);const t=f(e)?e:[e],r=c(t,a=>{if(w(a))return a.startsWith(this.a1SheetName)?a:`${this.a1SheetName}!${a}`;if(y(a)){const o=a;if(o.sheetId&&o.sheetId!==this.sheetId)throw new Error("Leave sheet ID blank or set to matching ID of this sheet");return{sheetId:this.sheetId,...a}}throw new Error("Each filter must be a A1 range string or gridrange object")});return this._spreadsheet.loadCells(r)}async saveUpdatedCells(){const e=P(A(this._cells),{_isDirty:!0});e.length&&await this.saveCells(e)}async saveCells(e){const t=c(e,a=>a._getUpdateRequest()),r=c(e,a=>`${this.a1SheetName}!${a.a1Address}`);if(!g(t).length)throw new Error("At least one cell must have something to update");await this._spreadsheet._makeBatchUpdateRequest(t,r)}async _ensureHeaderRowLoaded(){this._headerValues||await this.loadHeaderRow()}async loadHeaderRow(e){e!==void 0&&(this._headerRowIndex=e);const t=await this.getCellsInRange(`A${this._headerRowIndex}:${this.lastColumnLetter}${this._headerRowIndex}`);if(!t)throw new Error("No values in the header row - fill the first row with header values before trying to interact with rows");if(this._headerValues=c(t[0],r=>r?.trim()),!g(this.headerValues).length)throw new Error("All your header cells are blank - fill the first row with header values before trying to interact with rows")}async setHeaderRow(e,t){if(!e)return;if(e.length>this.columnCount)throw new Error(`Sheet is not large enough to fit ${e.length} columns. Resize the sheet first.`);const r=c(e,o=>o?.trim());if(J(r),!g(r).length)throw new Error("All your header cells are blank -");t&&(this._headerRowIndex=t);const a=await this._spreadsheet.sheetsApi.request({method:"put",url:`/values/${this.encodedA1SheetName}!${this._headerRowIndex}:${this._headerRowIndex}`,params:{valueInputOption:"USER_ENTERED",includeValuesInResponse:!0},data:{range:`${this.a1SheetName}!${this._headerRowIndex}:${this._headerRowIndex}`,majorDimension:"ROWS",values:[[...r,...Y(this.columnCount-r.length,()=>"")]]}});this._headerValues=a.data.updatedData.values[0]}async addRows(e,t={}){if(this.title.includes(":"))throw new Error('Please remove the ":" from your sheet title. There is a bug with the google API which breaks appending rows if any colons are in the sheet title.');if(!f(e))throw new Error("You must pass in an array of row values to append");await this._ensureHeaderRowLoaded();const r=[];u(e,i=>{let n;if(f(i))n=i;else if(y(i)){n=[];for(let d=0;d<this.headerValues.length;d++){const l=this.headerValues[d];n[d]=i[l]}}else throw new Error("Each row must be an object or an array");r.push(n)});const a=await this._spreadsheet.sheetsApi.request({method:"post",url:`/values/${this.encodedA1SheetName}!A${this._headerRowIndex}:append`,params:{valueInputOption:t.raw?"RAW":"USER_ENTERED",insertDataOption:t.insert?"INSERT_ROWS":"OVERWRITE",includeValuesInResponse:!0},data:{values:r}}),{updatedRange:o}=a.data.updates;let h=o.match(/![A-Z]+([0-9]+):?/)[1];return h=parseInt(h),this._ensureInfoLoaded(),t.insert?this._rawProperties.gridProperties.rowCount+=e.length:h+e.length>this.rowCount&&(this._rawProperties.gridProperties.rowCount=h+e.length-1),c(a.data.updates.updatedData.values,i=>new E(this,h++,i))}async addRow(e,t){return(await this.addRows([e],t))[0]}async getRows(e){const t=e?.offset||0,r=e?.limit||this.rowCount-1;await this._ensureHeaderRowLoaded();const a=1+this._headerRowIndex+t,o=a+r-1,h=I(this.headerValues.length),i=await this.getCellsInRange(`A${a}:${h}${o}`);if(!i)return[];const n=[];let d=a;for(let l=0;l<i.length;l++){const m=new E(this,d++,i[l]);this._rowCache[m.rowNumber]=m,n.push(m)}return n}_shiftRowCache(e){delete this._rowCache[e],this._rowCache.forEach(t=>{t.rowNumber>e&&t._updateRowNumber(t.rowNumber-1)})}async clearRows(e){const t=e?.start||this._headerRowIndex+1,r=e?.end||this.rowCount;await this._spreadsheet.sheetsApi.post(`/values/${this.encodedA1SheetName}!${t}:${r}:clear`),this._rowCache.forEach(a=>{a.rowNumber>=t&&a.rowNumber<=r&&a._clearRowData()})}async updateProperties(e){return this._makeSingleUpdateRequest("updateSheetProperties",{properties:{sheetId:this.sheetId,...e},fields:v(e)})}async updateGridProperties(e){return this.updateProperties({gridProperties:e})}async resize(e){return this.updateGridProperties(e)}async updateDimensionProperties(e,t,r){return this._makeSingleUpdateRequest("updateDimensionProperties",{range:{sheetId:this.sheetId,dimension:e,...r},properties:t,fields:v(t)})}async getCellsInRange(e,t){return(await this._spreadsheet.sheetsApi.get(`/values/${this.encodedA1SheetName}!${e}`,{params:t})).data.values}async updateNamedRange(){}async addNamedRange(){}async deleteNamedRange(){}async repeatCell(){}async autoFill(){}async cutPaste(){}async copyPaste(){}async mergeCells(e,t="MERGE_ALL"){await this._makeSingleUpdateRequest("mergeCells",{mergeType:t,range:this._addSheetIdToRange(e)})}async unmergeCells(e){await this._makeSingleUpdateRequest("unmergeCells",{range:this._addSheetIdToRange(e)})}async updateBorders(){}async addFilterView(){}async appendCells(){}async clearBasicFilter(){}async deleteDimension(){}async deleteEmbeddedObject(){}async deleteFilterView(){}async duplicateFilterView(){}async duplicate(e){const t=(await this._makeSingleUpdateRequest("duplicateSheet",{sourceSheetId:this.sheetId,...e?.index!==void 0&&{insertSheetIndex:e.index},...e?.id&&{newSheetId:e.id},...e?.title&&{newSheetName:e.title}})).properties.sheetId;return this._spreadsheet.sheetsById[t]}async findReplace(){}async insertDimension(e,t,r){if(!e)throw new Error("You need to specify a dimension. i.e. COLUMNS|ROWS");if(!y(t))throw new Error("`range` must be an object containing `startIndex` and `endIndex`");if(!x(t.startIndex)||t.startIndex<0)throw new Error("range.startIndex must be an integer >=0");if(!x(t.endIndex)||t.endIndex<0)throw new Error("range.endIndex must be an integer >=0");if(t.endIndex<=t.startIndex)throw new Error("range.endIndex must be greater than range.startIndex");if(r===void 0&&(r=t.startIndex>0),r&&t.startIndex===0)throw new Error("Cannot set inheritFromBefore to true if inserting in first row/column");return this._makeSingleUpdateRequest("insertDimension",{range:{sheetId:this.sheetId,dimension:e,startIndex:t.startIndex,endIndex:t.endIndex},inheritFromBefore:r})}async insertRange(){}async moveDimension(){}async updateEmbeddedObjectPosition(){}async pasteData(){}async textToColumns(){}async updateFilterView(){}async deleteRange(){}async appendDimension(){}async addConditionalFormatRule(){}async updateConditionalFormatRule(){}async deleteConditionalFormatRule(){}async sortRange(){}async setDataValidation(){}async setBasicFilter(){}async addProtectedRange(){}async updateProtectedRange(){}async deleteProtectedRange(){}async autoResizeDimensions(){}async addChart(){}async updateChartSpec(){}async updateBanding(){}async addBanding(){}async deleteBanding(){}async createDeveloperMetadata(){}async updateDeveloperMetadata(){}async deleteDeveloperMetadata(){}async randomizeRange(){}async addDimensionGroup(){}async deleteDimensionGroup(){}async updateDimensionGroup(){}async trimWhitespace(){}async deleteDuplicates(){}async addSlicer(){}async updateSlicerSpec(){}async delete(){return this._spreadsheet.deleteSheet(this.sheetId)}async copyToSpreadsheet(e){return this._spreadsheet.sheetsApi.post(`/sheets/${this.sheetId}:copyTo`,{destinationSpreadsheetId:e})}async clear(e){const t=e?`!${e}`:"";await this._spreadsheet.sheetsApi.post(`/values/${this.encodedA1SheetName}${t}:clear`),this.resetLocalCache(!0)}async downloadAsCSV(e=!1){return this._spreadsheet._downloadAs("csv",this.sheetId,e)}async downloadAsTSV(e=!1){return this._spreadsheet._downloadAs("tsv",this.sheetId,e)}async downloadAsPDF(e=!1){return this._spreadsheet._downloadAs("pdf",this.sheetId,e)}}var _=(s=>(s.GOOGLE_AUTH_CLIENT="google_auth",s.RAW_ACCESS_TOKEN="raw_access_token",s.API_KEY="api_key",s))(_||{});const $="https://sheets.googleapis.com/v4/spreadsheets",Q="https://www.googleapis.com/drive/v3/files",T={html:{},zip:{},xlsx:{},ods:{},csv:{singleWorksheet:!0},tsv:{singleWorksheet:!0},pdf:{singleWorksheet:!0}};function ee(s){if("getRequestHeaders"in s)return _.GOOGLE_AUTH_CLIENT;if("token"in s)return _.RAW_ACCESS_TOKEN;if("apiKey"in s)return _.API_KEY;throw new Error("Invalid auth")}async function N(s){if("getRequestHeaders"in s)return{headers:await s.getRequestHeaders()};if("apiKey"in s)return{params:{key:s.apiKey}};if("token"in s)return{headers:{Authorization:`Bearer ${s.token}`}};throw new Error("Invalid auth")}class C{constructor(e,t){this._rawProperties=null,this._spreadsheetUrl=null,this._deleted=!1,this.spreadsheetId=e,this.auth=t,this._rawSheets={},this._spreadsheetUrl=null,this.sheetsApi=D.create({baseURL:`${$}/${e}`,paramsSerializer:S,maxContentLength:1/0,maxBodyLength:1/0}),this.driveApi=D.create({baseURL:`${Q}/${e}`,paramsSerializer:S}),this.sheetsApi.interceptors.request.use(this._setAxiosRequestAuth.bind(this)),this.sheetsApi.interceptors.response.use(this._handleAxiosResponse.bind(this),this._handleAxiosErrors.bind(this)),this.driveApi.interceptors.request.use(this._setAxiosRequestAuth.bind(this)),this.driveApi.interceptors.response.use(this._handleAxiosResponse.bind(this),this._handleAxiosErrors.bind(this))}get authMode(){return ee(this.auth)}async _setAxiosRequestAuth(e){const t=await N(this.auth);return u(t.headers,(r,a)=>{e.headers.set(a,r)}),e.params={...e.params,...t.params},e}async _handleAxiosResponse(e){return e}async _handleAxiosErrors(e){const t=e.response?.data;if(t){if(!t.error)throw e;const{code:r,message:a}=t.error;throw e.message=`Google API error - [${r}] ${a}`,e}throw p(e,"response.status")===403&&"apiKey"in this.auth?new Error("Sheet is private. Use authentication or make public. (see https://github.com/theoephraim/node-google-spreadsheet#a-note-on-authentication for details)"):e}async _makeSingleUpdateRequest(e,t){const r=await this.sheetsApi.post(":batchUpdate",{requests:[{[e]:t}],includeSpreadsheetInResponse:!0});return this._updateRawProperties(r.data.updatedSpreadsheet.properties),u(r.data.updatedSpreadsheet.sheets,a=>this._updateOrCreateSheet(a)),r.data.replies[0][e]}async _makeBatchUpdateRequest(e,t){const r=await this.sheetsApi.post(":batchUpdate",{requests:e,includeSpreadsheetInResponse:!0,...t&&{responseIncludeGridData:!0,...t!=="*"&&{responseRanges:t}}});this._updateRawProperties(r.data.updatedSpreadsheet.properties),u(r.data.updatedSpreadsheet.sheets,a=>this._updateOrCreateSheet(a))}_ensureInfoLoaded(){if(!this._rawProperties)throw new Error("You must call `doc.loadInfo()` before accessing this property")}_updateRawProperties(e){this._rawProperties=e}_updateOrCreateSheet(e){const{properties:t,data:r}=e,{sheetId:a}=t;this._rawSheets[a]?this._rawSheets[a].updateRawData(t,r):this._rawSheets[a]=new V(this,t,r)}_getProp(e){return this._ensureInfoLoaded(),this._rawProperties[e]}get title(){return this._getProp("title")}get locale(){return this._getProp("locale")}get timeZone(){return this._getProp("timeZone")}get autoRecalc(){return this._getProp("autoRecalc")}get defaultFormat(){return this._getProp("defaultFormat")}get spreadsheetTheme(){return this._getProp("spreadsheetTheme")}get iterativeCalculationSettings(){return this._getProp("iterativeCalculationSettings")}async updateProperties(e){await this._makeSingleUpdateRequest("updateSpreadsheetProperties",{properties:e,fields:v(e)})}async loadInfo(e=!1){const t=await this.sheetsApi.get("/",{params:{...e&&{includeGridData:!0}}});this._spreadsheetUrl=t.data.spreadsheetUrl,this._rawProperties=t.data.properties,u(t.data.sheets,r=>this._updateOrCreateSheet(r))}resetLocalCache(){this._rawProperties=null,this._rawSheets={}}get sheetCount(){return this._ensureInfoLoaded(),k(this._rawSheets).length}get sheetsById(){return this._ensureInfoLoaded(),this._rawSheets}get sheetsByIndex(){return this._ensureInfoLoaded(),K(this._rawSheets,"index")}get sheetsByTitle(){return this._ensureInfoLoaded(),B(this._rawSheets,"title")}async addSheet(e={}){const t=(await this._makeSingleUpdateRequest("addSheet",{properties:G(e,"headerValues","headerRowIndex")})).properties.sheetId,r=this.sheetsById[t];return e.headerValues&&await r.setHeaderRow(e.headerValues,e.headerRowIndex),r}async deleteSheet(e){await this._makeSingleUpdateRequest("deleteSheet",{sheetId:e}),delete this._rawSheets[e]}async addNamedRange(e,t,r){return this._makeSingleUpdateRequest("addNamedRange",{name:e,namedRangeId:r,range:t})}async deleteNamedRange(e){return this._makeSingleUpdateRequest("deleteNamedRange",{namedRangeId:e})}async loadCells(e){const t=this.authMode===_.API_KEY,r=f(e)?e:[e],a=c(r,i=>{if(w(i))return t?i:{a1Range:i};if(y(i)){if(t)throw new Error("Only A1 ranges are supported when fetching cells with read-only access (using only an API key)");return{gridRange:i}}throw new Error("Each filter must be an A1 range string or a gridrange object")});let o;this.authMode===_.API_KEY?o=await this.sheetsApi.get("/",{params:{includeGridData:!0,ranges:a}}):o=await this.sheetsApi.post(":getByDataFilter",{includeGridData:!0,dataFilters:a});const{sheets:h}=o.data;u(h,i=>{this._updateOrCreateSheet(i)})}async _downloadAs(e,t,r){if(!T[e])throw new Error(`unsupported export fileType - ${e}`);if(T[e].singleWorksheet){if(t===void 0)throw new Error(`Must specify worksheetId when exporting as ${e}`)}else if(t)throw new Error(`Cannot specify worksheetId when exporting as ${e}`);if(e==="html"&&(e="zip"),!this._spreadsheetUrl)throw new Error("Cannot export sheet that is not fully loaded");const a=this._spreadsheetUrl.replace("/edit","/export");return(await this.sheetsApi.get(a,{baseURL:"",params:{id:this.spreadsheetId,format:e,...t&&{gid:t}},responseType:r?"stream":"arraybuffer"})).data}async downloadAsZippedHTML(e){return this._downloadAs("html",void 0,e)}async downloadAsHTML(e){return this._downloadAs("html",void 0,e)}async downloadAsXLSX(e=!1){return this._downloadAs("xlsx",void 0,e)}async downloadAsODS(e=!1){return this._downloadAs("ods",void 0,e)}async delete(){const e=await this.driveApi.delete("");return this._deleted=!0,e.data}async listPermissions(){return(await this.driveApi.request({method:"GET",url:"/permissions",params:{fields:"permissions(id,type,emailAddress,domain,role,displayName,photoLink,deleted)"}})).data.permissions}async setPublicAccessLevel(e){const t=await this.listPermissions(),r=U(t,a=>a.type==="anyone");if(e===!1){if(!r)return;await this.driveApi.request({method:"DELETE",url:`/permissions/${r.id}`})}else await this.driveApi.request({method:"POST",url:"/permissions",params:{},data:{role:e||"viewer",type:"anyone"}})}async share(e,t){let r,a;return e.includes("@")?r=e:a=e,(await this.driveApi.request({method:"POST",url:"/permissions",params:{...t?.emailMessage===!1&&{sendNotificationEmail:!1},...w(t?.emailMessage)&&{emailMessage:t?.emailMessage},...t?.role==="owner"&&{transferOwnership:!0}},data:{role:t?.role||"writer",...r&&{type:t?.isGroup?"group":"user",emailAddress:r},...a&&{type:"domain",domain:a}}})).data}static async createNewSpreadsheetDocument(e,t){if("apiKey"in e)throw new Error("Cannot use api key only to create a new spreadsheet - it is only usable for read-only access of public docs");const r=await N(e),a=await D.request({method:"POST",url:$,paramsSerializer:S,...r,data:{properties:t}}),o=new C(a.data.spreadsheetId,e);return o._spreadsheetUrl=a.data.spreadsheetUrl,o._rawProperties=a.data.properties,u(a.data.sheets,h=>o._updateOrCreateSheet(h)),o}}export{C as GoogleSpreadsheet,F as GoogleSpreadsheetCell,b as GoogleSpreadsheetCellErrorValue,E as GoogleSpreadsheetRow,V as GoogleSpreadsheetWorksheet};
