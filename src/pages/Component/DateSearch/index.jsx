import React, {useEffect, useState} from 'react';
import './index.css';
import axios from "axios";
import {AppUtils} from '../../../../utils/app_utils'
import locale from 'antd/lib/calendar/locale/zh_CN.js'
import {DatePicker, Image, List} from "antd";
import dayjs from 'dayjs';
import {Album} from '../../../models/Album'

const cheerio = require('cheerio')

const aqours = 'https://zh.moegirl.org.cn/LoveLive!Sunshine!!/%E9%9F%B3%E4%B9%90%E5%88%97%E8%A1%A8'
const niji = 'https://zh.moegirl.org.cn/LoveLive!%E8%99%B9%E5%92%B2%E5%AD%A6%E5%9B%AD%E5%AD%A6%E5%9B%AD%E5%81%B6%E5%83%8F%E5%90%8C%E5%A5%BD%E4%BC%9A/%E9%9F%B3%E4%B9%90%E5%88%97%E8%A1%A8'
const liella = 'https://zh.moegirl.org.cn/LoveLive!Superstar!!/%E9%9F%B3%E4%B9%90%E5%88%97%E8%A1%A8'
const lian = 'https://zh.moegirl.org.cn/%E8%8E%B2%E4%B9%8B%E7%A9%BA%E5%A5%B3%E5%AD%A6%E9%99%A2%E5%AD%A6%E5%9B%AD%E5%81%B6%E5%83%8F%E4%BF%B1%E4%B9%90%E9%83%A8'

// 以下链接100%出现涩图
// https://image.anosu.top/pixiv/direct?r18=1&keyword=
// LoveLive! lovelive
// 碧蓝航线 azurlane
// 碧蓝档案 bluearchive
// 原神 genshinimpact
// 明日方舟 arknights
// 崩坏三 honkai
// 命运 fate
// 少女前线 frontline
// 公主连接 princess

const dateFormat = 'YYYY-MM-DD';

const DateSearch = () => {

    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [rangeMoment, setRangeMoment] = useState([])

    useEffect(() => {
        const beginTime = AppUtils.toadyTimestamp()
        const endTime = beginTime + 86400000 * 30
        setRangeMoment([dayjs(dayjs(beginTime).format(dateFormat)), dayjs(dayjs(endTime).format(dateFormat))])
    }, [])

    useEffect(() => {
        if (rangeMoment.length <= 1) {
            return
        }
        fetchData()
    }, [rangeMoment])

    const fetchData = () => {
        setLoading(true)
        axios.all([
            requestUrl(aqours),
            requestUrl(niji),
            requestUrl(liella),
            requestUrl(lian),
        ]).then(axios.spread((arr1, arr2, arr3, arr4) => {
            const res1 = handleData(arr1)
            const res2 = handleData(arr2)
            const res3 = handleData(arr3)
            const res4 = handleData(arr4)
            const result = [...res1, ...res2, ...res3, ...res4]
            console.log(result.length)

            const tempList = []
            result.forEach(item => {
                if (rangeMoment[0] <= item.timestamp && item.timestamp <= rangeMoment[1]) {
                    tempList.push(item)
                }
            })
            setData(tempList)
            setLoading(false)
        }))
    }

    const requestUrl = (url) => {
        return axios({
            method: 'get',
            url: url
        })
    }

    const handleData = (response) => {
        const resp = response.data.replaceAll(`<span style="speak:none;visibility:hidden;color:transparent">0</span>`, "0")
        let $ = cheerio.load(resp)
        const contentArr = []
        $('.wikitable').each(function (i, v) {
            const titleMap = {}
            let isFirstRow = true
            let needContinue = true
            const data = $(v).get(0).children[1].children
            for (let rowIndex = 0; rowIndex < data.length && needContinue; rowIndex++) {
                if (rowIndex % 2 === 0) {
                    let album = new Album()
                    data[rowIndex].children.forEach((item, index) => {
                        if (index % 2 === 1) {
                            const recordIndex = Math.floor(index / 2)
                            item.children.forEach(item => {
                                if (rowIndex === 0) {
                                    if (AppUtils.hasString(item.data, "封面") || AppUtils.hasString(item.data, "名称") || AppUtils.hasString(item.data, "日期")) {
                                        titleMap[recordIndex] = item.data
                                    } else if (AppUtils.hasString(item.data, "演唱会")) {
                                        needContinue = false
                                    }
                                } else {
                                    if (isFirstRow) {
                                        isFirstRow = false
                                    }
                                    if (AppUtils.hasString(item.constructor.toString(), "Text()")) {
                                        if (AppUtils.hasString(item.data, "年") && AppUtils.isEmptyStr(album.timestamp)) {
                                            album.date = item.data
                                            album.timestamp = new Date(item.data.replace("年", "-").replace("月", "-").replace("日", "")).getTime()
                                        }
                                    } else {
                                        if (AppUtils.hasString(JSON.stringify(item.attribs), "title")) {
                                            let title
                                            if (AppUtils.hasString(item.children[0].constructor.toString(), "Element(")) {
                                                const children = item.children[0].children
                                                title = children[children.length - 1].data
                                            } else {
                                                title = item.children[0].data
                                                if (AppUtils.isEmptyStr(title)) {
                                                    title = item.attribs["title"]
                                                }
                                            }
                                            if (AppUtils.isEmptyStr(album.name) && !AppUtils.isEmptyStr(title)) {
                                                album.name = title
                                            }
                                        } else if (AppUtils.hasString(JSON.stringify(item.attribs), "image")) {
                                            if (AppUtils.isEmptyStr(album.image)) {
                                                album.image = item.children[0].attribs["src"]
                                            }
                                        } else {
                                            loopParse(item.children, album)
                                        }
                                    }
                                }
                            })
                        }
                    })
                    if (!AppUtils.isEmptyStr(album.name) && !AppUtils.isEmptyStr(album.timestamp)) {
                        contentArr.push(album)
                    }
                }
            }
        })
        return contentArr
    }

    const loopParse = (arr, album, type) => {
        arr.forEach(o => {
            if (AppUtils.hasString(o.constructor.toString(), "Element(")) {
                const json = JSON.stringify(o.attribs)
                if (AppUtils.hasString(json, "title")) {
                    loopParse(o.children, album, "title")
                } else if (AppUtils.hasString(json, `image`)) {
                    loopParse(o.children, album, "image")
                }
            } else {
                if (!AppUtils.isEmptyStr(type)) {
                    if (type === "title" && AppUtils.isEmptyStr(album.name)) {
                        album.name = o.data
                    } else if (type === "image" && AppUtils.isEmptyStr(album.image)) {
                        album.image = o.data
                    }
                }
            }
        })
    }

    const renderImg = (img) => {
        const arr = img.split('/')
        arr.pop()
        let image = arr.join('/')
        image = image.replace("/thumb/", '/')
        return (
            <Image
                src={image}
                preview={true}
                style={{width: 150, height: 150}}
                fallback={'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIg0KICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCI+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTgyNC40LDYwMS4yNWMtMTgsMjAtNTkuNSwxMjcuNS01MiwxODMsNC41LDguNSw1OCwxMiw3Ni00czQ5LTExMCw0Ni0xMzQtNDEtNDUtNDktNjMtMi0zNy0yLTkwdi0yYzAtMTU3LjQtMTI3LjYtMjg1LTI4NS0yODVzLTI4NSwxMjcuNi0yODUsMjg1djJjMCw1Myw2LDcyLTIsOTBzLTQ2LDM5LTQ5LDYzLDI4LDExOCw0NiwxMzQsNzYsNCw3Niw0Ig0KICAgICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZmYwMDczO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MTBweCIgLz4NCiAgICA8cGF0aCBkPSJNNzQ4LjA3LDc2Ny4yOUEyODUuNDcsMjg1LjQ3LDAsMCwxLDQ2OC43OSw4MjUuMiINCiAgICAgICAgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I2Y0YzQyZDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjEwcHgiIC8+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTI5Ny40LDYyNi4yNWMxOSw3MSw1NSwxODAsMTU1LjUsMjE0LjUtMzguNS00My41LTcyLjUtMTA2LjUtNzkuNS0xNjMuNSwxOSw0Myw0Niw2Myw4Miw3Ni03Mi0xMDItODEtMjY3LTExLTM4My05LDEwMCwyMCwyMTgsNzIuNSwyNzUuNS0xOS02OS0xOC41LTEyNS41LTQuNS0xNzQuNSw2LDc3LDI4LDE1MCw3NywxODYtMjItNTItMjctMTI3LTE4LjUtMTUzLjUsOC41LDUxLjUsNDQuNSw5OC41LDgwLjUsMTA5LjUtMjgtNTgtMzctMjI4LTE3LjUtMjQ3LjUsNTIsMCwxMjguNSw0My41LDE0OC41LDcyLjUsMTAsMTE2LTIwLDE5OS0xMjIsMjk1LDM5LDAsNzAtMTEsOTItMzEiDQogICAgICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNmNzkzMWU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDoxMHB4IiAvPg0KICAgIDxwb2x5bGluZQ0KICAgICAgICBwb2ludHM9IjI3MS40IDQwMS4yNSAyNDIuNCAzNzkuMjUgMjg5LjQgMzUwLjI1IDI0Mi40IDI5Ny4yNSAzMzYuNCAyNzEuMjUgMzc0LjQgMTU5LjI1IDQyOC40IDIxNy4yNSINCiAgICAgICAgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I2Y0YzQyZDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjEwcHgiIC8+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTMzMi40LDIwMy4yNWMtMzMtMjgtODMtMTgtMTEwLDMycy0xMSwxNTYtMTgsMjE3LTQ3LDEwOS03NSwxMzVjMjQtNCw1MC0xOCw2Ni0zOC0yMSw2Ny0yNCwxNzYsMjgsMjM2Ig0KICAgICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZjc5MzFlO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MTBweCIgLz4NCjwvc3ZnPg=='}
            />
        )
    }

    return (
        <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1}}>
                <DatePicker.RangePicker
                    locale={locale}
                    value={rangeMoment}
                    format={dateFormat}
                    onCalendarChange={(range) => setRangeMoment(range)}
                />
                <List
                    dataSource={data}
                    loading={loading}
                    renderItem={(item, index) => {
                        return (
                            <div key={"div" + index} style={{display: 'flex', flexDirection: 'column'}}>
                                <div style={{height: 20}}/>
                                <div style={{display: "flex", flexDirection: 'row'}}>
                                    {
                                        AppUtils.isEmptyStr(item.image) ?
                                            <Image
                                                style={{width: 150, height: 150}}
                                                preview={true}
                                                src={'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIg0KICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCI+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTgyNC40LDYwMS4yNWMtMTgsMjAtNTkuNSwxMjcuNS01MiwxODMsNC41LDguNSw1OCwxMiw3Ni00czQ5LTExMCw0Ni0xMzQtNDEtNDUtNDktNjMtMi0zNy0yLTkwdi0yYzAtMTU3LjQtMTI3LjYtMjg1LTI4NS0yODVzLTI4NSwxMjcuNi0yODUsMjg1djJjMCw1Myw2LDcyLTIsOTBzLTQ2LDM5LTQ5LDYzLDI4LDExOCw0NiwxMzQsNzYsNCw3Niw0Ig0KICAgICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZmYwMDczO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MTBweCIgLz4NCiAgICA8cGF0aCBkPSJNNzQ4LjA3LDc2Ny4yOUEyODUuNDcsMjg1LjQ3LDAsMCwxLDQ2OC43OSw4MjUuMiINCiAgICAgICAgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I2Y0YzQyZDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjEwcHgiIC8+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTI5Ny40LDYyNi4yNWMxOSw3MSw1NSwxODAsMTU1LjUsMjE0LjUtMzguNS00My41LTcyLjUtMTA2LjUtNzkuNS0xNjMuNSwxOSw0Myw0Niw2Myw4Miw3Ni03Mi0xMDItODEtMjY3LTExLTM4My05LDEwMCwyMCwyMTgsNzIuNSwyNzUuNS0xOS02OS0xOC41LTEyNS41LTQuNS0xNzQuNSw2LDc3LDI4LDE1MCw3NywxODYtMjItNTItMjctMTI3LTE4LjUtMTUzLjUsOC41LDUxLjUsNDQuNSw5OC41LDgwLjUsMTA5LjUtMjgtNTgtMzctMjI4LTE3LjUtMjQ3LjUsNTIsMCwxMjguNSw0My41LDE0OC41LDcyLjUsMTAsMTE2LTIwLDE5OS0xMjIsMjk1LDM5LDAsNzAtMTEsOTItMzEiDQogICAgICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiNmNzkzMWU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDoxMHB4IiAvPg0KICAgIDxwb2x5bGluZQ0KICAgICAgICBwb2ludHM9IjI3MS40IDQwMS4yNSAyNDIuNCAzNzkuMjUgMjg5LjQgMzUwLjI1IDI0Mi40IDI5Ny4yNSAzMzYuNCAyNzEuMjUgMzc0LjQgMTU5LjI1IDQyOC40IDIxNy4yNSINCiAgICAgICAgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6I2Y0YzQyZDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjEwcHgiIC8+DQogICAgPHBhdGgNCiAgICAgICAgZD0iTTMzMi40LDIwMy4yNWMtMzMtMjgtODMtMTgtMTEwLDMycy0xMSwxNTYtMTgsMjE3LTQ3LDEwOS03NSwxMzVjMjQtNCw1MC0xOCw2Ni0zOC0yMSw2Ny0yNCwxNzYsMjgsMjM2Ig0KICAgICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZjc5MzFlO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MTBweCIgLz4NCjwvc3ZnPg=='}
                                            /> : renderImg(item.image)
                                    }
                                    <div style={{
                                        width: 300,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'space-evenly'
                                    }}>
                                        <p style={{textAlign: 'center'}}>{item.name}</p>
                                        <p style={{textAlign: 'center'}}>{item.date}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    }}
                />
            </div>
        </div>
    );
};


export default DateSearch;
