import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux';
import { Row, Col, Form, Input, Button, Typography, message, Spin, Space, Image, Tabs, Select, Modal } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';
import { fbButton, line } from 'vanilla-sharing';
import { ROW_JUSTIFY, COL_SPAN, LOCAL_LANG } from '../common/const'
import API from '../config/api'
import { GetErrMsg } from '../config/errCode'
import { UrlQueryParamsParse, tranTimestamp } from '../common/globalFun'
import { useIntl } from "react-intl";

import HeaderLogo from '../components/HeaderLogo'
import PageBg from '../components/PageBg'
import QrIconImg from '../res/img/qr.png'
import LineIconImg from '../res/img/line.png'
import FaceBookIconImg from '../res/img/facebook.png'

import './css/style.css'

const { Title, Text } = Typography
const { TabPane } = Tabs;
const { Search } = Input;
const { TextArea } = Input

const InviteShare = (props) => {
const { history } = props
const intl = useIntl();
const [form] = Form.useForm();
const validateMessages = {
required: ''
}

const [token, setToken] = useState('') // from Windows identyToken
const [userportalToken, setUserportalToken] = useState('')
const [corpId, setCorpId] = useState('')
const [userName, setUserName] = useState('')
const [demoEmail, setDemoEmail] = useState('name@felo.com')
const [loading, setLoading] = useState(false)
const [tokenLoading, setTokenLoading] = useState(false)
const [expireTime, setExpireTime] = useState('----/--/--')
const [orgCode, setOrgCode] = useState('')
const [orgName, setOrgName] = useState('')
const [shareLink, setShareLink] = useState('')
const [shareQrCode, setShareQrCode] = useState('')
const [shareQrCodeModal, setShareQrCodeModal] = useState(false)

const copyLink = (value, event) => {
let copyValue = intl.formatMessage({ id: 'copy.link.value' }, { userName: userName, orgName: orgName, link: shareLink, orgCode: orgCode })
copy(copyValue).then(() => {
message.success(intl.formatMessage({ id: 'copy.success' }));
}).catch(() => {
message.error(intl.formatMessage({ id: 'copy.failed' }));
})
}

const copyCode = () => {
let copyValue = intl.formatMessage({ id: 'copy.code.value' }, { userName: userName, orgName: orgName, orgCode: orgCode, link: shareLink })
copy(copyValue).then(() => {
message.success(intl.formatMessage({ id: 'copy.success' }));
}).catch(() => {
message.error(intl.formatMessage({ id: 'copy.failed' }));
})
}

const emailSelectChange = (value) => {
console.log(`selected ${value}`);
}

const submit = (values) => {
console.log(values);

const { emailSelect } = values
const emailArr = checkEmailSelect(emailSelect)
console.log('emailArr', emailSelect)
if (!emailArr.length) {
return
}
invite(emailArr)
}

const checkEmailSelect = (emailSelect) => {
if (!emailSelect.length) {
return []
}
let errStr = ''
let rsp = []
emailSelect.map(item => {
if (!item.trim()) {
return
}
if (checkEmail(item)) {
rsp.push(item)
} else {
errStr += `"${item}",`
}
})
if (errStr) {
errStr = errStr.slice(0, -1)
message.error(intl.formatMessage(
{ id: 'email.err' },
{ email: errStr }
))
return []
}
return rsp
}

const checkEmail = (email) => {
const reg = /^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z0-9]{2,10}(\.[a-z]{2,10})*)$/i;
return reg.test(email);
}

const resetDemoEmail = (account) => {
if (!account) {
return
}

const emailStrArr = account.split("@")
const emialSuffix = emailStrArr[emailStrArr.length - 1]
setDemoEmail(`name@${emialSuffix}`)
}

const copy = (text) => {
return new Promise((resolve, reject) => {
let input = document.createElement('input');
document.body.appendChild(input);
input.setAttribute('value', text);
input.select();
if (document.execCommand('copy')) {
document.execCommand('copy');
} else {
reject('')
}
document.body.removeChild(input);
resolve('')
})
}

const saveQrCode = () => {
const imgUrl = shareQrCode
// 如果浏览器支持msSaveOrOpenBlob方法（也就是使用IE浏览器的时候），那么调用该方法去下载图片
if (window.navigator.msSaveOrOpenBlob) {
var bstr = atob(imgUrl.split(',')[1])
var n = bstr.length
var u8arr = new Uint8Array(n)
while (n--) {
u8arr[n] = bstr.charCodeAt(n)
}
var blob = new Blob([u8arr])
window.navigator.msSaveOrOpenBlob(blob, `${orgName}-QR-code` + '.' + 'png')
} else {
// 这里就按照chrome等新版浏览器来处理
const a = document.createElement('a')
a.href = imgUrl
a.setAttribute('download', `${orgName}-QR-code.png`)
a.click()
}
}

const toggleShareQrCodeModal = () => {
setShareQrCodeModal(!shareQrCodeModal)
}

const shareToFaceBook = () => {
if (!shareLink) {
return
}
fbButton({
url: shareLink,
})
}

const shareToLine = () => {
if (!shareLink) {
return
}
line({
url: shareLink,
title: intl.formatMessage({ id: 'copy.link.value' }, { userName: userName, orgName: orgName, link: shareLink, orgCode: orgCode }),
})
}

const resetWindowOpen = () => {
window.open = function (open) {
console.log('window.open')
return function (url, name, features) {
if (window.FeloSDK.isWindows || window.FeloSDK.isMac) {
window.FeloSDK.openBrowser(url)
} else {
return open.call(window, url, name, features);
}
};
}(window.open);
}

// 身份验证token 转成 V4 JWT token
const getV4Token = (token) => {
setTokenLoading(true)
const url = API.GET_JWT_TOKEN_V4
const param = {
header: {
token: token
}
}

fetch(url, {
method: 'POST',
body: JSON.stringify(param),
headers: new Headers({
'Accept': 'application/json',
'Content-Type': 'application/json',
'timestamp': new Date().getTime().toString(),
})
})
.then((response) => response.json())
.then((rsp) => {
const { status, jwtToken } = rsp
if (status.code == 0) {
props.setGlobalToken(jwtToken)
} else {
message.error(status.message)
}
})
.catch((error) => {
setTokenLoading(false)
message.error(JSON.stringify(error))
})
}

// 身份验证token 转成 userportal JWT token
const getUserportalToken = (token) => {
setLoading(true)
const url = API.GET_TOKEN
fetch(url, {
method: 'GET',
headers: new Headers({
'Accept': 'application/json',
'Content-Type': 'application/json',
'timestamp': new Date().getTime().toString(),
'token': token,
})
})
.then((response) => response.json())
.then((rsp) => {
if (rsp.errCode == "0000") {
setUserportalToken(rsp.token)
const { userInfo } = rsp
if (userInfo) {
const { buin, account, username } = userInfo
setCorpId(buin)
resetDemoEmail(account)
setUserName(username)
}
} else {
message.error(GetErrMsg(rsp.errCode))
}
})
.catch((error) => {
message.error(JSON.stringify(error))
})
.finally(() => {
setLoading(false)
})
}

// get url link
const getUrlLink = (isRest) => {
setTokenLoading(true)
const controller = new AbortController()
const timeoutId = setTimeout(() => {
controller.abort()
if (!orgCode) {
getUrlLink(isRest)
}
}, 5000)

const url = API.GET_SHARE_LINK
const param = {
path: "/invite/member", //组织链接分享专用path
reset: isRest //重置分享链接
}

fetch(url, {
method: 'POST',
body: JSON.stringify(param),
headers: new Headers({
'Accept': 'application/json',
'Content-Type': 'application/json',
'timestamp': new Date().getTime().toString(),
'Authorization': props.token,
}),
signal: controller.signal
})
.then((response) => response.json())
.then((rsp) => {
setTokenLoading(false)
const { data, status } = rsp
if (status && status.errCode == "0000") {
const { linkUrl, expireTime, extraData } = data
setExpireTime(tranTimestamp(expireTime))
setShareLink(linkUrl)
setOrgCode(extraData.teamCode || '')
setOrgName(extraData.teamName || '')
if (isRest) {
message.success(intl.formatMessage({ id: 'reset.success' }));
}
getShareQrcode(linkUrl)
resetWindowOpen()
} else {
message.error(GetErrMsg(rsp.errCode))
}
})
.catch((error) => {
setTokenLoading(false)
message.error(JSON.stringify(error))
}).finally(() => {
clearTimeout(timeoutId)
})
}

// 发送邀请接口
const invite = (emails) => {
setLoading(true)

const url = API.INVITE
const param = {
emails: emails,
lang: LOCAL_LANG[intl.locale],
deviceType: 'web', // 接口根据这个字段判断是否使用JWT token解析
corpId: corpId ? corpId : props.corpId,
}

fetch(url, {
method: 'POST',
body: JSON.stringify(param),
headers: new Headers({
'Accept': 'application/json',
'Content-Type': 'application/json',
'timestamp': new Date().getTime().toString(),
'token': userportalToken,
})
})
.then((response) => response.json())
.then((rsp) => {
setLoading(false)
if (rsp.errCode == "0000") {
history.push({ pathname: '/invite_result', data: { inviteResult: rsp.data } })
} else {
message.error(GetErrMsg(rsp.errCode))
}
})
.catch((error) => {
setLoading(false)
message.error(JSON.stringify(error))
})
}

// 获取二维码
const getShareQrcode = (qrCodeUrl) => {
const url = API.GET_SHARE_QRCODE
const param = {
url: qrCodeUrl, // 请求生成的二维码地址
noAvatar: false, // 二维码不需要头像
}

fetch(url, {
method: 'POST',
body: JSON.stringify(param),
headers: new Headers({
'Accept': 'application/json',
'Content-Type': 'application/json',
'timestamp': new Date().getTime().toString(),
'authorization': props.token,
})
})
.then((response) => response.json())
.then((rsp) => {
const { file, status } = rsp
if (status && status.errCode == "0000") {
setShareQrCode(file)
} else {
message.error(GetErrMsg(rsp.errCode))
}
})
.catch((error) => {
message.error(JSON.stringify(error))
})
}

const getUrlToken = () => {
const { search } = props.location
const urlQuertParamsStr = search.replace(/^\?/, '')
const queryParamsData = UrlQueryParamsParse(urlQuertParamsStr)
if (queryParamsData && queryParamsData.token) {
const iDentifytoken = decodeURIComponent(queryParamsData.token)
setToken(iDentifytoken)
}
}

useEffect(() => {
getUrlToken()
}, [])

useEffect(() => {
if (token) {
getV4Token(token)
getUserportalToken(token)
}
}, [token])

useEffect(() => {
if (props.token) {
getUrlLink(false)
}
}, [props.token])

/**
* Dom
*/

const codeBox = (code) => {
if (typeof code == 'number') {
code = String(code)
}
if (!code || !code.length) {
return loadingIcon()
}
return (
<span className={'code-box-wrap'}>
                {
                    code.split('').map((item, index) => {
                        return (
                            <span className={'code-box-item'} key={index}>{item}</span>
                        )
                    })
                }
            </span>
)
}

const loadingIcon = () => (
<Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
)

return (
<>
<PageBg />
<Row justify={ROW_JUSTIFY} align="middle" className={`height-full ${token ? 'no-margin-top' : ''}`}>
<Col span={COL_SPAN}>
<Title level={3}>{intl.formatMessage({ id: 'invite.fellows' })}</Title>

<Tabs defaultActiveKey="1" className={`invite-share-tab`}>
    <TabPane tab={intl.formatMessage({ id: 'tabpane.link' })} key="1" className={`tabpane-wrap`}>
    <div>
        <Text type="secondary">{intl.formatMessage({ id: 'link.expired' }, { time: expireTime })}</Text>
        <Button type="link" size="small" onClick={() => { getUrlLink(true) }}>
        {intl.formatMessage({ id: 'reset' })}
        </Button>
    </div>

    <div className={'mt-10'}></div>

    {/* <Search
        value={intl.formatMessage({ id: 'copy.link.value' }, { userName: userName, orgName: orgName, link: shareLink, orgCode: orgCode })}
    loading={tokenLoading}
    size={'large'}
    placeholder={intl.formatMessage({ id: 'invite.link.placeholder' })}
    enterButton={intl.formatMessage({ id: 'copy.link' })}
    onSearch={copyLink}
    /> */}

    <section className={`vertical-wrap`}>
        <div className={`copy-content-wrap`}>
            {intl.formatMessage({ id: 'copy.link.value' }, { userName: userName, orgName: orgName, link: shareLink, orgCode: orgCode })}
        </div>
        <div className={`mt-12`}>
            <Button type="primary" onClick={copyCode}>
                {intl.formatMessage({ id: 'copy.link' })}
            </Button>
        </div>
        <div className={`mt-12`}>
            <Text type="secondary">{intl.formatMessage({ id: 'other.ways' })}</Text>
        </div>
        <div>
            <Space className={`mt-10`} align="center" size={10}>
                <Button type="link" size="small" className={'btn-center'} onClick={toggleShareQrCodeModal}>
                    <Image width={24} src={QrIconImg} preview={false} />
                </Button>
                <Button type="link" size="small" className={'btn-center'} onClick={shareToLine}>
                    <Image width={24} src={LineIconImg} preview={false} />
                </Button>
                <Button type="link" size="small" className={'btn-center'} onClick={shareToFaceBook}>
                    <Image width={24} src={FaceBookIconImg} preview={false} />
                </Button>
            </Space>
        </div>
    </section>
    </TabPane>

    <TabPane tab={intl.formatMessage({ id: 'tabpane.email' })} key="2" className={`tabpane-wrap`}>
    <Form
            form={form}
            onFinish={submit}
            validateTrigger={'onSubmit'}
            validateMessages={validateMessages}
    >
        <Form.Item
                className={`email-textarea-wrap`}
                name="emailSelect"
                rules={[
                {
                required: true,
                message: "Please enter email",
        }
        ]}
        >
        <Select
                mode="tags"
                size="large"
                className={`custom-select-placeholder`}
                onChange={emailSelectChange} tokenSeparators={[',']}
                open={false}
                placeholder={intl.formatMessage({ id: 'invite.emial.placeholder' }, { email: demoEmail })}
        />
        </Form.Item>

        <Form.Item className={'content-right'}>
            <Button
                    size={'large'}
                    type="primary"
                    htmlType="submit"
                    loading={loading}
            >
                {intl.formatMessage({ id: 'send.invitation' })}
            </Button>
        </Form.Item>
    </Form>
    </TabPane>

    <TabPane tab={intl.formatMessage({ id: 'tabpane.code' })} key="3" className={`tabpane-wrap`}>
    <section className={`org-code-tab-wrap`}>
        <p>{intl.formatMessage({ id: 'org.code.introduce.title' })}</p>
        <div className={'ml-10 mt-20'}>
        {codeBox(orgCode)}
        </div>
        <div className={`mt-30`}>
            <Button type="primary" onClick={copyCode}>
                {intl.formatMessage({ id: 'copy' })}
            </Button>
        </div>

        {/* <Space direction="vertical" className={`org-code-desc`} size={1}>
        <Text strong>{intl.formatMessage({ id: 'org.code.desc1' })}</Text>
        <Text>{intl.formatMessage({ id: 'org.code.desc2' })}</Text>
        <Text>{intl.formatMessage({ id: 'org.code.desc3' })}</Text>
        <Text>{intl.formatMessage({ id: 'org.code.desc4' })}</Text>
    </Space> */}
    </section>
    </TabPane>
</Tabs>

<Modal
        className={`modal-center`}
        title={intl.formatMessage({ id: 'title.modal.qrcode' })}
visible={shareQrCodeModal}
onCancel={toggleShareQrCodeModal}
footer={null}
centered
>
<section className={`share-qrcode-modal`}>
    <Space direction="vertical" className={`org-code-desc`} size={10} align={'center'}>
        {
        shareQrCode
        ? <Image width={180} src={shareQrCode} preview={false} />
        : loadingIcon()
        }
        <Text strong>{intl.formatMessage({ id: 'label.org.code' }, { code: orgCode })}</Text>
        <Text>{intl.formatMessage({ id: 'code.expired.on' }, { time: expireTime })}</Text>
        <Button
                disabled={!shareQrCode}
                className={`mt-12`}
                size={'large'}
                type={'primary'}
                style={{ width: 166 }}
                onClick={saveQrCode}
        >
            {intl.formatMessage({ id: 'save' })}
        </Button>
    </Space>
</section>
</Modal>
</Col>
</Row>
</>
)
}

const stateProps = (state) => {
return {
token: state.token,
email: state.email,
loginKey: state.loginKey,
corpId: state.corpId,
corpName: state.corpName,
}
}

const dispatchProps = (dispatch) => ({
setGlobalToken: (token) => {
dispatch({
type: 'setToken',
value: token
})
}
})

export default connect(stateProps, dispatchProps)(InviteShare)