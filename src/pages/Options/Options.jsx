import React, {useEffect, useState} from 'react';
import {getComponentStack, getCurrent, goTo, popToTop, Router} from 'react-chrome-extension-router';
import DateSearch from "../Component/DateSearch";
import PicCompress from "../Component/PicCompress";

import {
  ContainerOutlined,
  DesktopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined
} from "@ant-design/icons";
import {Button, Menu} from "antd";
import ImportHelper from "../Component/ImportHelper";

const Options = () => {
  function getItem(label, key, icon, children, type) {
    return {
      key,
      icon,
      children,
      label,
      type,
    };
  }

  const onClick = (e) => {
    switch (e.key) {
      case '1':
        popToTop()
        break
      case '2':
        goTo(DateSearch)
        break
      case '3':
        goTo(PicCompress)
        break
      default:
        break
    }
  };

  const items = [
    getItem('发售日期查询', '1', <PieChartOutlined/>),
    getItem('专辑导入助手', '2', <DesktopOutlined/>),
    getItem('图片压缩工具', '3', <ContainerOutlined/>),
    // getItem('Navigation One', 'sub1', <MailOutlined />, [
    //     getItem('Option 5', '5'),
    //     getItem('Option 6', '6'),
    //     getItem('Option 7', '7'),
    //     getItem('Option 8', '8'),
    // ]),
    // getItem('Navigation Two', 'sub2', <AppstoreOutlined />, [
    //     getItem('Option 9', '9'),
    //     getItem('Option 10', '10'),
    //     getItem('Submenu', 'sub3', null, [getItem('Option 11', '11'), getItem('Option 12', '12')]),
    // ]),
  ];

  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const {component, props} = getCurrent();
    console.log(
        component
            ? `There is a component on the stack! ${component} with ${props}`
            : `The current stack is empty so Router's direct children will be rendered`
    );
    const components = getComponentStack();
    console.log(`The stack has ${components.length} components on the stack`);
  });

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div>
          <Button
              type="primary"
              onClick={toggleCollapsed}
              style={{
                marginBottom: 16,
              }}
          >
            {collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
          </Button>
          <Menu
              style={{
                width: collapsed ? 80 : 256,
              }}
              onClick={onClick}
              inlineCollapsed={collapsed}
              mode="inline"
              items={items}
          />
        </div>
        <Router>
          <ImportHelper/>
        </Router>
      </div>
  );
};

export default Options;
