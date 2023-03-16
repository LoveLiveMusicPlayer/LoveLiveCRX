import React, {useEffect, useRef, useState} from 'react';
import {Button, DatePicker, Form, Input, Select, Tabs, message} from 'antd';
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import locale from 'antd/lib/calendar/locale/zh_CN.js'
import {Music} from '../../../models/Music'
import RenderTabItem from './RenderItem'
import {AppUtils} from "../../../../utils/app_utils";
import dayjs from "dayjs";

const ImportHelper = () => {
    const [messageApi, contextHolder] = message.useMessage();

    const [activeKey, setActiveKey] = useState()
    const [coverList, setCoverList] = useState([])
    const [tabs, setTabs] = useState([])
    const [photoList, setPhotoList] = useState([{"value": "Cover_1.jpg"}])
    const [artist, setArtist] = useState([])

    const newTabIndex = useRef(0);
    const [form] = Form.useForm()

    const onEdit = (targetKey, action) => {
        if (action === 'add') {
            addTab();
        } else {
            removeTab(targetKey);
            const _musicList = form.getFieldValue('musicList')
            delete _musicList[targetKey]
            form.setFieldValue('musicList', Object.keys(_musicList).length ? _musicList : null)
        }
    };

    const addTab = () => {
        const albumId = form.getFieldValue("id")
        const albumName = form.getFieldValue("albumName")
        const baseUrl = form.getFieldValue("base_url")
        if (AppUtils.isEmptyStr(albumId) || AppUtils.isEmptyStr(albumName) || AppUtils.isEmptyStr(baseUrl)) {
            messageApi.open({
                type: 'error',
                content: '请先填写专辑信息'
            })
            return
        }

        const newActiveKey = `Music${newTabIndex.current++}`;
        renderTab((newTab) => {
            newTab.push({
                label: 'Music' + tabs.length,
                music: new Music(),
                key: newActiveKey,
                children: <RenderTabItem newActiveKey={newActiveKey} coverList={coverList} artist={artist}/>
            })
        })
        setActiveKey(newActiveKey);
    };

    const removeTab = (targetKey) => {
        const targetIndex = tabs.findIndex((pane) => pane.key === targetKey);
        const newPanes = tabs.filter((pane) => pane.key !== targetKey);
        const tempList = []
        newPanes.forEach((value, index) => {
            value.label = "Music" + index
            tempList.push(value)
        })
        if (tempList.length && targetKey === activeKey) {
            const {key} = tempList[targetIndex === tempList.length ? targetIndex - 1 : targetIndex];
            setActiveKey(key);
        }
        setTabs(tempList);
    };

    const renderTab = (addFunc) => {
        const newTab = []
        tabs.forEach((value, index) => {
            newTab.push({
                label: "Music" + index,
                music: value.music,
                key: value.key,
                children: <RenderTabItem newActiveKey={value.key} coverList={coverList} artist={artist}/>
            })
        })
        addFunc && addFunc(newTab)
        setTabs(newTab)
    }

    const onFinish = (value) => {
        if (!form.getFieldValue('musicList')) {
            messageApi.open({
                type: 'error',
                content: '请添加歌曲列表信息'
            })
            return
        }

        const coverList = []
        value.cover_path.map(item => {
            coverList.push(value.base_url + item.value)
        })

        const musicIdList = []
        const musicList = []
        for (let i in value.musicList) {
            const music = value.musicList[i]
            const musicId = Number.parseInt(music.musicId)
            musicIdList.push(musicId)
            musicList.push({
                "id": musicId,
                "name": music.musicName,
                "album": Number.parseInt(value.id),
                "cover_path": music.cover_path,
                "music_path": music.music_path,
                "artist": artist.find(v => v.value === music.artist).label,
                "artist_bin": music.artist,
                "time": dayjs(music.time).format('mm:ss'),
                "albumName": value.albumName,
                "export": music.export,
                "base_url": value.base_url
            })
        }

        const album = {
            "id": Number.parseInt(value.id),
            "name": value.albumName,
            "category": value.category,
            "date": dayjs(value.date).format('YYYY.MM.DD'),
            "cover_path": coverList,
            "music": musicIdList
        }

        console.log(JSON.stringify(album))
        console.log(JSON.stringify(musicList))
    }

    useEffect(() => {
        fetch('artist.json')
            .then(resp => resp.json())
            .then(setArtist)
    }, [])

    useEffect(() => {
        const arr = []
        photoList.map(item => {
            arr.push({
                value: item.value,
                label: item.value
            })
        })
        setCoverList(arr)
    }, [photoList])

    useEffect(() => {
        renderTab()
    }, [coverList])

    return (
        <div style={{width: '500px'}}>
            {contextHolder}
            <Form
                form={form}
                layout="horizontal"
                style={{width: '100%'}}
                onFinish={onFinish}
            >
                <Form.Item label={"专辑id"} name={"id"}
                           getValueFromEvent={(e) => {
                               const {value} = e.target;
                               return value.replace(/\D/g, '')
                           }}
                           rules={[
                               {
                                   required: true,
                                   message: '请输入专辑id',
                                   pattern: new RegExp(/^[1-9]\d*$/, "g"),
                               },
                           ]}>
                    <Input maxLength={3}/>
                </Form.Item>
                <Form.Item label={"专辑名"} name={"albumName"} rules={[
                    {
                        required: true,
                        message: '请输入专辑名',
                    },
                ]}>
                    <Input/>
                </Form.Item>
                <Form.Item label={"专辑路径"} name={"base_url"} rules={[
                    {
                        required: true,
                        message: '请输入专辑路径',
                    },
                ]}>
                    <Input/>
                </Form.Item>
                <Form.Item label={"发售日期"} name={"date"} rules={[
                    {
                        required: true,
                        message: '请选择发售日期',
                    },
                ]}>
                    <DatePicker locale={locale}/>
                </Form.Item>
                <Form.List name={"cover_path"} initialValue={photoList}>
                    {(fields, {add, remove}, {errors}) => (
                        <>
                            {fields.map((field, index) => {
                                return (
                                    <Form.Item
                                        style={{position: "relative"}}
                                        labelCol={{span: 24}}
                                        label={index === 0 ? '专辑图' : ''}
                                        required={true}
                                        key={field.key}
                                    >
                                        {
                                            index === 0 ?
                                                <Form.Item style={{position: "absolute", top: -40, left: 80}}>
                                                    <Button
                                                        type="dashed"
                                                        onClick={() => {
                                                            let length = form.getFieldValue("cover_path").length + 1
                                                            add({value: `Cover_${length}.jpg`})
                                                            setPhotoList(form.getFieldValue("cover_path"))
                                                        }}
                                                        style={{width: '50px'}}
                                                        icon={<PlusOutlined/>}
                                                    />
                                                </Form.Item> : null
                                        }
                                        <Form.Item
                                            {...field}
                                            validateTrigger={['onChange', 'onBlur']}
                                            name={[field.name, "value"]}
                                            rules={[
                                                {
                                                    required: true,
                                                    whitespace: true,
                                                    message: "请输入或删除该条目",
                                                },
                                            ]}
                                            noStyle
                                        >
                                            <Input
                                                placeholder="请输入专辑图文件名"
                                                style={{width: '90%'}}
                                            />
                                        </Form.Item>
                                        {fields.length > 1 ? (
                                            <MinusCircleOutlined
                                                style={{marginLeft: '5%'}}
                                                className="dynamic-delete-button"
                                                onClick={() => {
                                                    remove(field.name)
                                                    const tempList = form.getFieldValue("cover_path")
                                                    setPhotoList(tempList)
                                                }}
                                            />
                                        ) : null}
                                        <Form.ErrorList errors={errors}/>
                                    </Form.Item>
                                )
                            })}
                        </>
                    )}
                </Form.List>
                <Form.Item label="分类" name={"category"} rules={[
                    {
                        required: true,
                        message: '请选择分类',
                    },
                ]}>
                    <Select>
                        <Select.Option value="单曲">单曲</Select.Option>
                        <Select.Option value="动画">动画</Select.Option>
                        <Select.Option value="独唱">独唱</Select.Option>
                        <Select.Option value="精选集">精选集</Select.Option>
                        <Select.Option value="其他">其他</Select.Option>
                        <Select.Option value="小组曲">小组曲</Select.Option>
                        <Select.Option value="组合">组合</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label={"歌曲列表"} labelCol={{span: 24}} validateFirst={true} required={true}>
                    <Tabs
                        onChange={setActiveKey}
                        activeKey={activeKey}
                        type="editable-card"
                        onEdit={onEdit}
                        items={tabs}/>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        生成
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default ImportHelper;