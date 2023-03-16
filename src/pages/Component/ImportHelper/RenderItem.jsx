import {Form, Input, Select, Switch, TimePicker} from "antd";
import React from "react";
import locale from 'antd/lib/calendar/locale/zh_CN.js'

const RenderTabItem = (props) => {
    const {coverList, newActiveKey, artist} = props

    return (
        <Form.Item name={['musicList', newActiveKey]}>
            <>
                <Form.Item label={'歌曲id'} name={['musicList', newActiveKey, 'musicId']}
                   getValueFromEvent={(e) => {
                       const {value} = e.target;
                       return value.replace(/\D/g, '')
                   }}
                   rules={[
                    {
                        required: true,
                        message: '请输入歌曲id',
                        pattern: new RegExp(/^[1-9]\d*$/, "g"),
                    },
                ]}>
                    <Input maxLength={3}/>
                </Form.Item>

                <Form.Item label={'歌曲名'} name={['musicList', newActiveKey, 'musicName']} rules={[
                    {
                        required: true,
                        message: '请输入歌曲名',
                    },
                ]}>
                    <Input/>
                </Form.Item>

                <Form.Item label={'封面图'} name={['musicList', newActiveKey, 'cover_path']}
                           initialValue={coverList[0].label}
                           required={true}>
                    <Select options={coverList}/>
                </Form.Item>

                <Form.Item label={'歌曲路径'} name={['musicList', newActiveKey, 'music_path']} rules={[
                    {
                        required: true,
                        message: '请输入歌曲路径',
                    },
                ]}>
                    <Input/>
                </Form.Item>

                <Form.Item label={'歌手'} name={['musicList', newActiveKey, 'artist']} rules={[
                    {
                        required: true,
                        message: '请选择歌手',
                    },
                ]}>
                    <Select
                        onChange={value => console.log(value)}
                        options={artist}
                    />
                </Form.Item>

                {/*<Form.Item label={'歌手36进制'} name={['musicList', newActiveKey, 'artist_bin']}>*/}
                {/*    <Input disabled/>*/}
                {/*</Form.Item>*/}

                <Form.Item label={'时长'} name={['musicList', newActiveKey, 'time']} rules={[
                    {
                        required: true,
                        message: '请输入歌曲id',
                    },
                ]}>
                    <TimePicker format={'mm:ss'} locale={locale} showNow={false}/>
                </Form.Item>

                <Form.Item label={'可导出'} name={['musicList', newActiveKey, 'export']} valuePropName="checked"
                           initialValue>
                    <Switch checkedChildren="是" unCheckedChildren="否"/>
                </Form.Item>
            </>
        </Form.Item>
    )
}
export default RenderTabItem;